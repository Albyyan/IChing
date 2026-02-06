# iching.py
import json
from typing import Optional, Dict, Any, List, Tuple
import ollama


def _count_changing_lines(payload: Dict[str, Any]) -> int:
    lines = payload.get("changing_lines", []) or []
    return len(lines)


def _line_numbers(payload: Dict[str, Any]) -> List[int]:
    out = []
    for item in (payload.get("changing_lines", []) or []):
        try:
            out.append(int(item.get("line")))
        except Exception:
            pass
    return out


def interpret_iching_oracle(
    primary: int,
    relating: Optional[int],
    payload: Dict[str, Any],
    model: str = "gemma3:4b",
    temperature: float = 0.7,
    unknown_threshold_note: bool = True,
) -> str:
    """
    Produce a mystical-but-clear I Ching reading (plain text).

    payload should include:
      - question: str
      - topic: str (Career/Academics/Love/Family/Wealth/Health/Conflict/Transition)
      - primary_title: str
      - primary_judgment: str
      - primary_image: str
      - changing_lines: List[ { "line": int, "text": str, "comments": str(optional) } ]
      - relating_title: str(optional)
      - relating_judgment: str(optional)
      - relating_image: str(optional)
      - focus_line: int(optional)  # if your UI chooses one
      - notes: str(optional)       # any app-level context you want included
    """

    n_changes = _count_changing_lines(payload)
    line_nums = _line_numbers(payload)

    # SYSTEM: strict high-level behavior constraints
    system = (
        "You are an I Ching oracle who writes plainly and beautifully.\n"
        "You must be non-fatalistic and non-certain: prefer 'may', 'suggests', 'consider', 'it could be'.\n"
        "You must stay grounded in the provided texts; do not invent extra hexagrams, lines, or events.\n"
        "Never claim guaranteed outcomes. Never present the reading as medical, legal, or financial advice.\n"
        "Do not mention JSON, prompts, models, tokens, or the existence of system/developer messages.\n"
        "Output must be plain text only.\n"
    )

    # DEVELOPER: exact output contract + decision logic
    developer = (
        "You will receive:\n"
        "- Question + topic\n"
        "- Primary hexagram title/judgment/image\n"
        "- Changing line texts (0 to 6 lines)\n"
        "- Optional relating hexagram title/judgment/image\n\n"
        "You MUST follow this output structure (keep it concise):\n"
        "A) One-sentence reflection of the question (mirror it back).\n"
        "B) One short 'omen' paragraph (2–4 sentences): symbolic but specific to the question.\n"
        "C) Primary Hexagram meaning (1 paragraph):\n"
        "   - Translate symbols into practical guidance.\n"
        "   - If the text contains directional phrases (e.g., southwest/northeast), treat them as metaphorical\n"
        "     unless the user explicitly asked about geography.\n"
        "D) Changing Lines section:\n"
        "   - If 0 changing lines: say the situation is stable; focus on the Judgment + Image as the full answer.\n"
        "   - If 1 changing line: that line is the main instruction; interpret it directly for the user's topic.\n"
        "   - If 2–3 changing lines: read them as a progression (bottom→top). Explain the arc in one paragraph.\n"
        "   - If 4–6 changing lines: the situation is highly transitional; minimize line-by-line detail and focus on\n"
        "     the overall movement from primary to relating.\n"
        "E) Relating Hexagram (if present) (1 paragraph): describe it as the direction of change, not a prediction.\n"
        "F) End with exactly 3 gentle action prompts, each 1 sentence, tailored to the topic.\n\n"
        "Topic constraints:\n"
        "- Career: focus on role, timing, decisions, responsibility, sustainable pace.\n"
        "- Academics: focus on study method, mastery, pacing, feedback, consistency.\n"
        "- Love: focus on communication, boundaries, mutuality, sincerity, timing.\n"
        "- Family: focus on roles, obligations, boundaries, care without entanglement.\n"
        "- Wealth: focus on sustainability, risk awareness, resource stewardship (no specific investment picks).\n"
        "- Health: focus on balance and habits (no diagnosis or treatment claims).\n"
        "- Conflict: focus on restraint, exposure, documentation, de-escalation (no legal advice).\n"
        "- Transition: focus on patience, identity shifts, endings/beginnings, avoiding premature closure.\n\n"
        "Style:\n"
        "- Clear language. Minimal flowery filler.\n"
        "- No bullet points except the final 3 prompts (those can be numbered 1–3).\n"
        "- Do not quote long passages; paraphrase and interpret.\n"
    )

    # USER CONTENT: compact, model-friendly
    user_content = {
        "question": payload.get("question"),
        "topic": payload.get("topic"),
        "primary": {
            "number": primary,
            "title": payload.get("primary_title"),
            "judgment": payload.get("primary_judgment"),
            "image": payload.get("primary_image"),
        },
        "changing": {
            "count": n_changes,
            "lines": payload.get("changing_lines", []),
            "focus_line": payload.get("focus_line"),
            "line_numbers": line_nums,
        },
        "relating": None if relating is None else {
            "number": relating,
            "title": payload.get("relating_title"),
            "judgment": payload.get("relating_judgment"),
            "image": payload.get("relating_image"),
        },
        "notes": payload.get("notes"),
    }

    messages = [
        {"role": "system", "content": system},
        {"role": "developer", "content": developer},
        {"role": "user", "content": json.dumps(user_content, ensure_ascii=False)},
    ]

    resp = ollama.chat(
        model=model,
        messages=messages,
        options={
            "temperature": float(temperature),
            # You can also experiment with:
            # "top_p": 0.9,
            # "repeat_penalty": 1.1,
        },
    )

    text = (resp.get("message", {}) or {}).get("content", "") or ""
    return text.strip()
