import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix

# 1. Load dataset
df = pd.read_csv("QuestionType.csv")

X = df["question"]
y = df["label"]

# 2. Train / test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 3. Build pipeline
model = Pipeline([
    ("tfidf", TfidfVectorizer(
        ngram_range=(1, 3),
        analyzer="word",
        min_df=2,
        lowercase=True,
        stop_words="english"
    )),
    ("clf", LogisticRegression(
        max_iter=1000,
        class_weight="balanced"
    ))
])

# 4. Train
model.fit(X_train, y_train)

# 5. Evaluate
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)

print("Classification report:\n")
print(classification_report(y_test, y_pred))

print("Confusion matrix:\n")
print(confusion_matrix(y_test, y_pred))

# 6. Example predictions
examples = [
    "Will X love me?",
    "Should I get a job now or later",
    "Hi what am i meant to do",
    "How should governments regulate AI?"
]

print("\nExample predictions:")
for q in examples:
    prob_open = model.predict_proba([q])[0][model.classes_.tolist().index("open")]
    label = model.predict([q])[0]
    print(f"{q} → {label} (open prob = {prob_open:.2f})")
