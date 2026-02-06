# server.py
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
import traceback
import joblib
import pandas as pd

from iching import interpret_iching_oracle

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the topic classification model
try:
    topic_model = joblib.load("topic_model.joblib")
    print("✓ Topic model loaded successfully")
except Exception as e:
    print(f"⚠ Warning: Could not load topic_model.joblib: {e}")
    topic_model = None

# Note: open/closed model would need to be trained and saved first
# For now, we'll use a simple heuristic
def classify_open_closed(question: str) -> tuple[str, float]:
    """
    Simple heuristic classifier for open vs closed questions.
    Returns (label, confidence)
    """
    question_lower = question.lower().strip()
    
    # Closed question indicators
    closed_starters = ['will', 'is', 'are', 'should i', 'do i', 'does', 'can i', 'am i']
    
    # Check if question starts with closed indicators
    for starter in closed_starters:
        if question_lower.startswith(starter):
            return ("closed", 0.75)
    
    # Check for yes/no pattern
    if question_lower.endswith('?'):
        # Simple check: if very short and starts with common closed words
        words = question_lower.split()
        if len(words) <= 6 and words[0] in ['will', 'is', 'are', 'should', 'do', 'does', 'can', 'am']:
            return ("closed", 0.70)
    
    # Default to open
    return ("open", 0.60)


class ClassifyQuestionRequest(BaseModel):
    question: str


class TopicAlternative(BaseModel):
    topic: str
    confidence: float


class ClassifyQuestionResponse(BaseModel):
    question_type: str  # open or closed
    confidence: float
    topic: str
    topic_confidence: float
    topic_alternatives: List[TopicAlternative]  # top 3 alternatives


@app.post("/api/classify_question")
def classify_question(req: ClassifyQuestionRequest) -> ClassifyQuestionResponse:
    """
    Classify a question as open/closed and determine its topic.
    """
    try:
        # Classify open/closed
        q_type, q_conf = classify_open_closed(req.question)
        
        # Classify topic
        topic = "Unknown"
        topic_conf = 0.0
        alternatives = []
        
        if topic_model:
            X = pd.DataFrame({"text": [req.question]})
            probs = topic_model.predict_proba(X)[0]
            classes = topic_model.named_steps["clf"].classes_
            
            # Sort by probability
            ranked = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)
            
            # Get top prediction
            topic, topic_conf = ranked[0]
            
            # Get top 3 alternatives
            alternatives = [
                TopicAlternative(topic=lbl, confidence=float(prob)) 
                for lbl, prob in ranked[:3]
            ]
            
            # If confidence is too low, mark as Unknown
            if topic_conf < 0.35:
                topic = "Unknown"
        
        return ClassifyQuestionResponse(
            question_type=q_type,
            confidence=q_conf,
            topic=topic,
            topic_confidence=topic_conf,
            topic_alternatives=alternatives
        )
        
    except Exception as e:
        print(f"Error classifying question: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


class InterpretMysticalRequest(BaseModel):
    primary: int
    relating: Optional[int] = None
    model: str = "gemma3:4b"
    
    # Question context
    question: Optional[str] = None
    question_type: Optional[str] = None  # open/closed
    topic: Optional[str] = None

    # raw texts from frontend (Wilhelm)
    primary_title: Optional[str] = None
    primary_judgment: Optional[str] = None
    primary_image: Optional[str] = None

    changing_lines: List[Dict[str, Any]] = []  # [{line, text, comments}]

    relating_title: Optional[str] = None
    relating_judgment: Optional[str] = None
    relating_image: Optional[str] = None


@app.post("/api/interpret_mystical", response_class=PlainTextResponse)
def interpret_mystical(req: InterpretMysticalRequest):
    try:
        payload = {
            "question": req.question,
            "topic": req.topic,
            "primary_title": req.primary_title,
            "primary_judgment": req.primary_judgment,
            "primary_image": req.primary_image,
            "changing_lines": req.changing_lines,
            "relating_title": req.relating_title,
            "relating_judgment": req.relating_judgment,
            "relating_image": req.relating_image,
        }

        text = interpret_iching_oracle(
            primary=req.primary,
            relating=req.relating,
            payload=payload,
            model=req.model,
        )

        if not text:
            return PlainTextResponse("The oracle is silent. Cast again with a steadier hand.", status_code=200)

        return PlainTextResponse(text, status_code=200)

    except Exception as e:
        print(f"Error during interpretation: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Interpretation failed: {str(e)}")