import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import classification_report, confusion_matrix


def train_topic_model(csv_path="QuestionTopic.csv", model_out="topic_model.joblib"):
    df = pd.read_csv(csv_path).dropna(subset=["question", "topic"])
    X = df["question"].astype(str)
    y = df["topic"].astype(str)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Two-channel TF-IDF: word ngrams + char ngrams
    # Combine using a ColumnTransformer on a single text column via "passthrough" trick.
    # Easiest is FeatureUnion, but ColumnTransformer is fine with a DataFrame.
    X_train_df = pd.DataFrame({"text": X_train})
    X_test_df  = pd.DataFrame({"text": X_test})

    features = ColumnTransformer(
        transformers=[
            ("word", TfidfVectorizer(
                ngram_range=(1, 3),
                sublinear_tf=True,
                min_df=1,
                max_df=0.95,
                lowercase=True,
                stop_words="english"
            ), "text"),
            ("char", TfidfVectorizer(
                analyzer="char_wb",
                ngram_range=(3, 5),
                sublinear_tf=True,
                min_df=1,
                lowercase=True
            ), "text"),
        ]
    )

    base_svm = LinearSVC(class_weight="balanced")
    clf = CalibratedClassifierCV(base_svm, method="sigmoid", cv=5)

    pipe = Pipeline([
        ("feats", features),
        ("clf", clf)
    ])

    # Hyperparameter tuning (small but effective)
    param_grid = {
        "clf__estimator__C": [0.5, 1.0, 2.0, 4.0]
    }

    search = GridSearchCV(
        pipe, param_grid=param_grid,
        scoring="f1_macro", cv=5, n_jobs=-1, verbose=0
    )

    search.fit(X_train_df, y_train)

    best = search.best_estimator_
    y_pred = best.predict(X_test_df)

    print("Best params:", search.best_params_)
    print("\nClassification report:\n")
    print(classification_report(y_test, y_pred))

    print("Confusion matrix (rows=true, cols=pred):\n")
    labels = best.named_steps["clf"].classes_
    print(confusion_matrix(y_test, y_pred, labels=labels))

    joblib.dump(best, model_out)
    print(f"\nSaved model to: {model_out}")
    return best


def predict_topic(model, question: str, unknown_threshold: float = 0.35, top_k: int = 3):
    X = pd.DataFrame({"text": [question]})
    probs = model.predict_proba(X)[0]
    classes = model.named_steps["clf"].classes_

    ranked = sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)
    pred, conf = ranked[0]

    if conf < unknown_threshold:
        return "Unknown", conf, ranked[:top_k]

    return pred, conf, ranked[:top_k]


if __name__ == "__main__":
    model = train_topic_model("QuestionTopic.csv", "topic_model.joblib")

    tests = [
        "Is this investment decision too risky?",
        "How should I respond to an accusation?",
        "What is ending in my life right now?"
    ]
    for q in tests:
        pred, conf, top3 = predict_topic(model, q, unknown_threshold=0.35)
        top3_str = ", ".join([f"{lbl}:{p:.2f}" for lbl, p in top3])
        print(f"\n{q}\n→ {pred} (conf={conf:.2f}) | top3={top3_str}")
