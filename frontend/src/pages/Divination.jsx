// src/pages/Divination.jsx
import { useEffect, useMemo, useState } from "react";
import WILHELM from "../data/iching_wilhelm_translation.js";
import { Link } from "react-router-dom";
import ZenBackground from "../components/ZenBackground.jsx";

/**
 * 3-coin method:
 * Heads = 3, Tails = 2
 * Sum:
 * 6 = old yin (changing)   -> yin line, changing
 * 7 = young yang           -> yang line, not changing
 * 8 = young yin            -> yin line, not changing
 * 9 = old yang (changing)  -> yang line, changing
 *
 * We build lines bottom -> top (1..6).
 * Wilhelm dataset `binary` is treated as top -> bottom (6..1),
 * so we reverse our collected bits to match.
 */

const TOPIC_OPTIONS = [
  "Career",
  "Academics",
  "Love",
  "Family",
  "Money",
  "Health",
  "Conflict",
  "Transition"
];

function randSide() {
  return Math.random() < 0.5 ? "H" : "T";
}

function sumCoins(coins) {
  return coins.reduce((acc, c) => acc + (c === "H" ? 3 : 2), 0);
}

function lineFromCoins(coins) {
  const sum = sumCoins(coins);
  const yinYang = sum === 7 || sum === 9 ? "yang" : "yin";
  const changing = sum === 6 || sum === 9;
  return { coins, sum, yinYang, changing };
}

function hasChangingLines(linesBottomToTop) {
  return linesBottomToTop.some((l) => l.changing);
}

function applyChanges(linesBottomToTop) {
  return linesBottomToTop.map((l) => {
    if (!l.changing) return l;
    return {
      ...l,
      yinYang: l.yinYang === "yang" ? "yin" : "yang",
      changing: true,
    };
  });
}

function toBinaryTopToBottom(linesBottomToTop) {
  const bitsBottomToTop = linesBottomToTop.map((l) => (l.yinYang === "yang" ? "1" : "0"));
  return bitsBottomToTop.slice().reverse().join("");
}

function findHexByBinary(binaryTopToBottom) {
  if (!binaryTopToBottom) return null;
  const entry = Object.values(WILHELM).find((h) => String(h.binary) === binaryTopToBottom);
  return entry || null;
}

function Coin({ side, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "relative w-20 h-20 rounded-full border border-white/20",
        "bg-white/5 backdrop-blur-md grid place-items-center select-none",
        "transition active:scale-95 hover:bg-white/10",
        disabled ? "opacity-40 cursor-not-allowed" : "",
      ].join(" ")}
      aria-label="Flip coin"
    >
      <div className="text-2xl font-semibold">{side === "H" ? "陽" : "陰"}</div>
      <div className="absolute bottom-2 text-[10px] tracking-widest text-white/50">
        {side === "H" ? "HEADS" : "TAILS"}
      </div>
    </button>
  );
}

function HexLine({ line, indexFromBottom, highlight }) {
  const isYang = line.yinYang === "yang";
  const changing = line.changing;

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-lg px-2 py-2",
        highlight ? "bg-white/10 border border-white/15" : "",
      ].join(" ")}
    >
      <div className="w-8 text-[11px] tracking-widest text-white/40">{indexFromBottom}</div>
      <div className="w-4 text-xs text-white/70">{changing ? "×" : ""}</div>

      <div className="flex-1">
        {isYang ? (
          <div className="h-2 rounded bg-white/90" />
        ) : (
          <div className="flex gap-3">
            <div className="h-2 flex-1 rounded bg-white/90" />
            <div className="h-2 flex-1 rounded bg-white/90" />
          </div>
        )}
      </div>

      <div className="w-10 text-right text-xs text-white/50">{line.sum}</div>
    </div>
  );
}

function HexagramCard({ title, subtitle, linesBottomToTop, focusLineNumbers = [] }) {
  const shown = linesBottomToTop.slice().reverse(); // display top->bottom

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm tracking-widest uppercase text-white/80">{title}</h2>
          {subtitle && <div className="mt-1 text-xs text-white/50">{subtitle}</div>}
        </div>
        <div className="text-xs text-white/40">Top</div>
      </div>

      <div className="mt-6 space-y-2">
        {shown.map((l, idxTop) => {
          const indexFromBottom = shown.length - idxTop;
          const highlight = focusLineNumbers.includes(indexFromBottom);
          return (
            <HexLine
              key={idxTop}
              line={l}
              indexFromBottom={indexFromBottom}
              highlight={highlight}
            />
          );
        })}

        {!linesBottomToTop.length && <div className="text-white/40 text-sm">No lines yet.</div>}
      </div>

      <div className="mt-4 text-right text-xs text-white/40">Bottom</div>
    </div>
  );
}

function ResultBlock({ label, hex, binary }) {
  return (
    <div>
      <div className="text-xs tracking-widest uppercase text-white/60">{label}</div>

      <div className="mt-2 text-2xl font-light">
        {hex ? (
          <>
            <span className="mr-2">{hex.hex_font}</span>
            <span className="text-white/90">
              {hex.hex}. {hex.english}
            </span>
          </>
        ) : (
          <span className="text-white/50">No match for binary {binary}</span>
        )}
      </div>

      <div className="mt-1 text-xs text-white/50">binary: {binary}</div>

      {hex?.wilhelm_judgment?.text && (
        <pre className="mt-4 whitespace-pre-wrap text-sm text-white/80 leading-relaxed">
          {hex.wilhelm_judgment.text}
        </pre>
      )}

      {hex?.wilhelm_image?.text && (
        <pre className="mt-4 whitespace-pre-wrap text-sm text-white/70 leading-relaxed">
          {hex.wilhelm_image.text}
        </pre>
      )}
    </div>
  );
}

function ChangingLinesBlock({ primaryHex, changingLineNumbers }) {
  if (!primaryHex?.wilhelm_lines) return null;
  if (!changingLineNumbers.length) return null;

  const single = changingLineNumbers.length === 1;
  const focus = single ? changingLineNumbers[0] : null;

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      <div className="text-xs tracking-widest uppercase text-white/60">
        {single ? `Focus line: ${focus}` : "Changing lines"}
      </div>

      {single ? (
        (() => {
          const ln = primaryHex.wilhelm_lines[String(focus)];
          if (!ln) return <div className="mt-3 text-sm text-white/50">No line text found.</div>;

          return (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-5">
              {ln.text && (
                <pre className="whitespace-pre-wrap text-sm text-white/85 leading-relaxed">
                  {ln.text}
                </pre>
              )}
              {ln.comments && (
                <pre className="mt-3 whitespace-pre-wrap text-xs text-white/55 leading-relaxed">
                  {ln.comments}
                </pre>
              )}
            </div>
          );
        })()
      ) : (
        <div className="mt-3 space-y-5">
          {changingLineNumbers.map((n) => {
            const ln = primaryHex.wilhelm_lines[String(n)];
            if (!ln) return null;

            return (
              <div key={n} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-xs tracking-widest uppercase text-white/60">Line {n}</div>
                {ln.text && (
                  <pre className="mt-2 whitespace-pre-wrap text-sm text-white/85 leading-relaxed">
                    {ln.text}
                  </pre>
                )}
                {ln.comments && (
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-white/55 leading-relaxed">
                    {ln.comments}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Divination() {
  const [time, setTime] = useState(Date.now());
  
  // Question input phase
  const [question, setQuestion] = useState("");
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [classification, setClassification] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  
  // Coin casting phase
  const [coins, setCoins] = useState(["H", "H", "H"]);
  const [lines, setLines] = useState([]);
  
  // Oracle phase
  const [oracleText, setOracleText] = useState("");
  const [oracleError, setOracleError] = useState("");
  const [oracleLoading, setOracleLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(Date.now()), 100);
    return () => clearInterval(t);
  }, []);

  const complete = lines.length === 6;
  const changingLineNumbers = useMemo(() => {
    if (!complete) return [];
    return lines
      .map((l, idx) => (l.changing ? idx + 1 : null))
      .filter((v) => v != null);
  }, [lines, complete]);

  const anyChanging = useMemo(() => hasChangingLines(lines), [lines]);
  const changedLines = useMemo(() => (complete ? applyChanges(lines) : []), [complete, lines]);

  const primaryBinary = useMemo(() => (complete ? toBinaryTopToBottom(lines) : null), [complete, lines]);
  const relatingBinary = useMemo(
    () => (complete && anyChanging ? toBinaryTopToBottom(changedLines) : null),
    [complete, anyChanging, changedLines]
  );

  const primaryHex = useMemo(() => findHexByBinary(primaryBinary), [primaryBinary]);
  const relatingHex = useMemo(() => findHexByBinary(relatingBinary), [relatingBinary]);

  const focusLinesForHighlight = changingLineNumbers.length === 1 ? changingLineNumbers : [];

  async function handleQuestionSubmit(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setClassifying(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/classify_question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setClassification(data);
      setSelectedTopic(data.topic);
      setQuestionSubmitted(true);
    } catch (e) {
      console.error("Classification error:", e);
      // Fallback: just proceed without classification
      setClassification({
        question_type: "open",
        confidence: 0.5,
        topic: "Unknown",
        topic_confidence: 0.0,
        topic_alternatives: []
      });
      setSelectedTopic("Unknown");
      setQuestionSubmitted(true);
    } finally {
      setClassifying(false);
    }
  }

  function flipCoin(i) {
    if (complete) return;
    setCoins((prev) => {
      const next = prev.slice();
      next[i] = randSide();
      return next;
    });
  }

  function castLine() {
    if (complete) return;
    const line = lineFromCoins(coins);
    setLines((prev) => [...prev, line]);
  }

  function autoFlipAndCast() {
    if (complete) return;
    const newCoins = [randSide(), randSide(), randSide()];
    setCoins(newCoins);
    
    setTimeout(() => {
      const line = lineFromCoins(newCoins);
      setLines((prev) => [...prev, line]);
    }, 300);
  }

  function resetAll() {
    setQuestion("");
    setQuestionSubmitted(false);
    setClassification(null);
    setSelectedTopic("");
    setLines([]);
    setCoins(["H", "H", "H"]);
    setOracleText("");
    setOracleError("");
    setOracleLoading(false);
  }

  async function requestOracle() {
    if (!complete || !primaryHex) return;

    setOracleLoading(true);
    setOracleError("");
    setOracleText("");

    const changing_lines = changingLineNumbers.map((n) => {
      const ln = primaryHex?.wilhelm_lines?.[String(n)];
      return { line: n, text: ln?.text ?? "", comments: ln?.comments ?? "" };
    });

    const body = {
      primary: primaryHex.hex,
      relating: anyChanging ? (relatingHex?.hex ?? null) : null,
      model: "gemma3:4b",
      
      // NEW: Include question context
      question: question || null,
      question_type: classification?.question_type || null,
      topic: selectedTopic || null,

      primary_title: `${primaryHex.hex}. ${primaryHex.english}`,
      primary_judgment: primaryHex?.wilhelm_judgment?.text ?? "",
      primary_image: primaryHex?.wilhelm_image?.text ?? "",

      changing_lines,

      relating_title: anyChanging && relatingHex ? `${relatingHex.hex}. ${relatingHex.english}` : null,
      relating_judgment: anyChanging ? (relatingHex?.wilhelm_judgment?.text ?? "") : null,
      relating_image: anyChanging ? (relatingHex?.wilhelm_image?.text ?? "") : null,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/interpret_mystical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const text = await res.text();
      setOracleText(text);
    } catch (e) {
      setOracleError(e?.message ?? String(e));
    } finally {
      setOracleLoading(false);
    }
  }

  useEffect(() => {
    if (complete) requestOracle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white px-6 py-10">
      <ZenBackground time={time} />

      {/* Top bar */}
      <div className="relative z-10 mx-auto max-w-6xl flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-thin tracking-widest">DIVINATION</h1>
          <p className="mt-3 text-sm tracking-widest text-white/60 uppercase max-w-xl">
            {!questionSubmitted 
              ? "Enter your question to begin the consultation"
              : "Click coins to flip them. 'Cast line' records one line (bottom → top)."}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/"
            className="px-5 py-3 text-xs tracking-widest uppercase border border-white/20 hover:bg-white hover:text-black transition"
          >
            Back
          </Link>
          {(questionSubmitted || complete) && (
            <button
              onClick={resetAll}
              className="px-5 py-3 text-xs tracking-widest uppercase border border-white/20 hover:bg-white hover:text-black transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-6xl mt-12 space-y-8">
        {/* Question input phase */}
        {!questionSubmitted && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 max-w-3xl mx-auto">
            <h2 className="text-xl tracking-widest uppercase text-white/90 mb-6">Your Question</h2>
            
            <form onSubmit={handleQuestionSubmit} className="space-y-6">
              <div>
                <label htmlFor="question" className="block text-sm tracking-wide text-white/70 mb-3">
                  What guidance do you seek from the I Ching?
                </label>
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., How should I approach this career transition?"
                  className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 min-h-[100px] resize-y"
                  disabled={classifying}
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-white/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>The I Ching works best with open-ended questions that explore "how" or "what" rather than yes/no questions.</span>
              </div>

              <button
                type="submit"
                disabled={!question.trim() || classifying}
                className="w-full px-8 py-4 bg-white text-black text-sm tracking-widest uppercase hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {classifying ? "Analyzing question..." : "Begin divination"}
              </button>
            </form>
          </div>
        )}

        {/* Classification results */}
        {questionSubmitted && !complete && classification && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 max-w-3xl mx-auto space-y-6">
            <div>
              <div className="text-xs tracking-widest uppercase text-white/60 mb-2">Your Question</div>
              <p className="text-white/90 italic">"{question}"</p>
            </div>

            {/* Question type warning */}
            {classification.question_type === "closed" && classification.confidence > 0.6 && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-sm text-yellow-100/90">
                    <div className="font-semibold mb-1">Notice: This appears to be a yes/no question</div>
                    <div className="text-yellow-100/70">
                      The I Ching works best with open-ended questions that explore possibilities and guidance rather than seeking definitive answers. Consider rephrasing to ask "how" or "what" instead.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Topic classification */}
            <div>
              <div className="text-xs tracking-widest uppercase text-white/60 mb-3">
                Question Topic {classification.topic_confidence < 0.35 && <span className="text-white/40">(uncertain)</span>}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {TOPIC_OPTIONS.map((topic) => {
                  const isSelected = selectedTopic === topic;
                  const isDetected = classification.topic === topic;
                  
                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={[
                        "px-4 py-2 rounded-lg text-sm tracking-wide transition",
                        isSelected 
                          ? "bg-white text-black" 
                          : isDetected
                            ? "bg-white/20 text-white border border-white/30"
                            : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                      ].join(" ")}
                    >
                      {topic}
                      {isDetected && !isSelected && (
                        <span className="ml-1 text-xs">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {classification.topic_alternatives.length > 0 && (
                <div className="mt-3 text-xs text-white/50">
                  Detected: {classification.topic_alternatives.map(a => 
                    `${a.topic} (${(a.confidence * 100).toFixed(0)}%)`
                  ).join(", ")}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 text-center text-sm text-white/60">
              When ready, proceed to cast your hexagram below
            </div>
          </div>
        )}

        {/* Coins section */}
        {questionSubmitted && !complete && (
          <div className="flex flex-col items-center gap-6 transition-all duration-700 ease-out">
            <div className="flex gap-4">
              {coins.map((side, i) => (
                <Coin key={i} side={side} onClick={() => flipCoin(i)} disabled={complete} />
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={castLine}
                disabled={complete}
                className="px-8 py-3 bg-white text-black text-xs tracking-widest uppercase hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cast Line {lines.length + 1}/6
              </button>
              <button
                onClick={autoFlipAndCast}
                disabled={complete}
                className="px-8 py-3 border border-white/20 text-white text-xs tracking-widest uppercase hover:bg-white hover:text-black transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Auto Cast
              </button>
            </div>
          </div>
        )}

        {/* Hexagram display */}
        {lines.length > 0 && (
          <div className={`grid gap-6 transition-all duration-700 ease-out ${
            anyChanging && complete ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-2xl mx-auto'
          }`}>
            <HexagramCard
              title="Primary Hexagram"
              subtitle={complete && primaryHex ? `${primaryHex.hex}. ${primaryHex.english}` : "Building..."}
              linesBottomToTop={lines}
              focusLineNumbers={focusLinesForHighlight}
            />
            {anyChanging && complete && (
              <HexagramCard
                title="Relating Hexagram"
                subtitle={relatingHex ? `${relatingHex.hex}. ${relatingHex.english}` : ""}
                linesBottomToTop={changedLines}
              />
            )}
          </div>
        )}

        {/* Results */}
        {complete && primaryHex && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-8 transition-all duration-700 ease-out animate-fade-in-result">
            {/* Show question context */}
            {question && (
              <div className="pb-6 border-b border-white/10">
                <div className="text-xs tracking-widest uppercase text-white/60 mb-2">Your Question</div>
                <p className="text-white/90 italic mb-2">"{question}"</p>
                {selectedTopic && selectedTopic !== "Unknown" && (
                  <div className="text-xs text-white/50">Topic: {selectedTopic}</div>
                )}
              </div>
            )}

            <ResultBlock label="Primary Hexagram" hex={primaryHex} binary={primaryBinary} />
            
            {anyChanging && relatingHex && (
              <ResultBlock label="Relating Hexagram" hex={relatingHex} binary={relatingBinary} />
            )}

            <ChangingLinesBlock primaryHex={primaryHex} changingLineNumbers={changingLineNumbers} />

            {/* Oracle interpretation */}
            {oracleLoading && (
              <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60">
                Loading oracle interpretation...
              </div>
            )}

            {oracleError && (
              <div className="mt-8 pt-8 border-t border-white/10 text-red-400">
                Error: {oracleError}
              </div>
            )}

            {oracleText && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="text-xs tracking-widest uppercase text-white/60 mb-4">
                  Oracle Interpretation
                </div>
                <pre className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed">
                  {oracleText}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}