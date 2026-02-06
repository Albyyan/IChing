# I Ching Divination - Question Classification Update

## Overview

This update adds question input and classification to your I Ching divination app. Users now:

1. **Enter a question** before casting the hexagram
2. **Get automatic classification** of whether their question is open or closed
3. **Receive a warning** if the question is closed (yes/no style)
4. **See topic classification** with options to adjust the detected topic
5. **Get personalized interpretations** based on their question context

## Changes Made

### 1. Backend Updates (`server.py`)

#### New Endpoint: `/api/classify_question`
- Accepts a question string
- Returns classification data:
  ```json
  {
    "question_type": "open" | "closed",
    "confidence": 0.75,
    "topic": "Career",
    "topic_confidence": 0.82,
    "topic_alternatives": [
      {"topic": "Career", "confidence": 0.82},
      {"topic": "Money", "confidence": 0.11},
      {"topic": "Transition", "confidence": 0.05}
    ]
  }
  ```

#### Open/Closed Classification
Currently uses a **simple heuristic** that checks for:
- Question starters: "will", "is", "are", "should i", "do i", "does", "can i", "am i"
- Question length and structure

**To improve**: Train a proper model using `train_open_closed.py` with your `QuestionType.csv` dataset, then load it in `server.py`.

#### Topic Classification
- Loads the pre-trained `topic_model.joblib` (from your training script)
- Classifies questions into: Career, Academics, Love, Family, Money, Health, Conflict, Transition
- Returns top 3 predictions with confidence scores
- Marks as "Unknown" if confidence < 0.35

#### Updated `/api/interpret_mystical`
Now accepts additional fields:
- `question`: The user's question text
- `question_type`: "open" or "closed"
- `topic`: The selected topic

### 2. Oracle Logic Updates (`iching.py`)

The interpretation function now:
- Receives question context in the payload
- Instructs the LLM to:
  - Acknowledge the question and topic
  - Provide an opening omen that resonates with the question
  - Interpret the hexagram specifically in relation to the question
  - Give action prompts that address the question's topic

### 3. Frontend Updates (`Divination.jsx`)

#### New Question Input Phase
Before coin casting, users see:
- A textarea to enter their question
- Helpful hint about open-ended questions
- Submit button that triggers classification

#### Classification Results Display
After submitting:
- Shows the user's question
- **Warning banner** if question is detected as closed (yes/no)
- Topic selector with 8 options:
  - Career, Academics, Love, Family, Money, Health, Conflict, Transition
  - Auto-selects detected topic
  - Shows confidence scores
  - Allows manual override

#### Enhanced Oracle Interpretation
- Question context displayed above hexagram results
- Oracle interpretation now references the question
- More relevant and personalized guidance

## Topics Supported

The classification model recognizes these 8 question types:

1. **Career** - Job, work, professional development
2. **Academics** - Education, learning, study
3. **Love** - Romance, relationships, dating
4. **Family** - Family matters, parenting, relatives
5. **Money** - Finances, investments, wealth
6. **Health** - Physical/mental wellbeing
7. **Conflict** - Disputes, disagreements, tensions
8. **Transition** - Life changes, moving, new phases

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- FastAPI backend running
- Ollama with gemma3:4b model

### Backend Setup

1. **Install dependencies:**
```bash
pip install fastapi uvicorn joblib pandas scikit-learn ollama --break-system-packages
```

2. **Ensure you have the topic model:**
```bash
# If you don't have topic_model.joblib, train it:
python train_topic_model.py

# This creates topic_model.joblib from QuestionTopic.csv
```

3. **Replace your server files:**
```bash
# Backup originals
cp server.py server.py.backup
cp iching.py iching.py.backup

# Copy new versions
cp server.py server.py
cp iching.py iching.py
```

4. **Start the server:**
```bash
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Setup

1. **Replace Divination component:**
```bash
# Backup original
cp src/pages/Divination.jsx src/pages/Divination.jsx.backup

# Copy new version
cp Divination.jsx src/pages/Divination.jsx
```

2. **Start the dev server:**
```bash
npm run dev
```

## Usage Flow

1. User navigates to /divination
2. User enters their question in the textarea
3. Clicks "Begin divination"
4. System classifies the question:
   - Detects if open/closed
   - Determines topic
5. If closed question detected, warning is shown
6. User can adjust the topic if needed
7. User proceeds to cast hexagram (existing flow)
8. Oracle interpretation now references the question and topic

## Improving Classification Accuracy

### For Open/Closed Classification

Currently using a simple heuristic. To improve:

1. **Train a proper model:**
```bash
python train_open_closed.py
```

2. **Update server.py** to load and use the trained model:
```python
# Add at top of server.py
open_closed_model = joblib.load("open_closed_model.joblib")

# Replace classify_open_closed function:
def classify_open_closed(question: str) -> tuple[str, float]:
    pred = open_closed_model.predict([question])[0]
    prob = open_closed_model.predict_proba([question])[0]
    conf = prob[open_closed_model.classes_.tolist().index(pred)]
    return (pred, conf)
```

### For Topic Classification

The topic model is already trained. To retrain or improve:

1. **Edit QuestionTopic.csv** to add more examples
2. **Retrain:**
```bash
python train_topic_model.py
```
3. **Restart the server** to load the new model

## API Examples

### Classify a Question
```bash
curl -X POST http://127.0.0.1:8000/api/classify_question \
  -H "Content-Type: application/json" \
  -d '{"question": "How should I approach this career transition?"}'
```

Response:
```json
{
  "question_type": "open",
  "confidence": 0.60,
  "topic": "Career",
  "topic_confidence": 0.85,
  "topic_alternatives": [
    {"topic": "Career", "confidence": 0.85},
    {"topic": "Transition", "confidence": 0.10},
    {"topic": "Money", "confidence": 0.03}
  ]
}
```

### Get Interpretation with Question Context
```bash
curl -X POST http://127.0.0.1:8000/api/interpret_mystical \
  -H "Content-Type: application/json" \
  -d '{
    "primary": 1,
    "relating": 43,
    "question": "How should I approach this career transition?",
    "question_type": "open",
    "topic": "Career",
    "primary_title": "1. The Creative",
    "primary_judgment": "...",
    "changing_lines": [...]
  }'
```

## Troubleshooting

### "Topic model not loaded" warning
- Ensure `topic_model.joblib` is in the same directory as `server.py`
- Run `train_topic_model.py` to generate the model

### Classification returns "Unknown"
- Confidence threshold is set to 0.35
- Question might be ambiguous or not match trained categories
- User can manually select the correct topic

### Server connection errors
- Verify backend is running on http://127.0.0.1:8000
- Check CORS settings in server.py match your frontend URL
- Ensure no firewall blocking

### Ollama model errors
- Verify Ollama is running: `ollama list`
- Ensure gemma3:4b is installed: `ollama pull gemma3:4b`

## Future Enhancements

1. **Better Open/Closed Detection**
   - Train on larger dataset
   - Use more sophisticated NLP features
   - Add confidence threshold tuning

2. **More Topics**
   - Add: Spirituality, Creativity, Purpose, etc.
   - Allow custom topics

3. **Question Refinement**
   - Suggest improvements to closed questions
   - Auto-convert to open-ended format

4. **Context Memory**
   - Remember previous questions in session
   - Allow follow-up questions

5. **Multi-language Support**
   - Detect and classify non-English questions
   - Translate if needed

## Files Modified

- ✅ `server.py` - Added classification endpoint, updated interpretation
- ✅ `iching.py` - Enhanced to use question context
- ✅ `Divination.jsx` - Complete UI overhaul with question input phase

## Files Unchanged

- `train_open_closed.py` - Training script (use to create model)
- `train_topic_model.py` - Training script (already creates the model)
- `topic_model.joblib` - Pre-trained model (loaded by server)
- `App.jsx`, `App.css`, `index.css`, `main.jsx` - No changes needed

---

**Questions or issues?** Check the console logs in both frontend and backend for detailed error messages.