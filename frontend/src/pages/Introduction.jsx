import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ZenBackground from "../components/ZenBackground.jsx";

export default function Introduction() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime((p) => p + 0.05), 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white px-6 py-10">
      <ZenBackground time={time} />

      {/* Top bar */}
      <div className="relative z-10 mx-auto max-w-4xl flex items-start justify-between gap-4 mb-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-thin tracking-widest">THE I CHING</h1>
          <p className="mt-3 text-sm tracking-widest text-white/60 uppercase">
            Book of Changes
          </p>
        </div>

        <Link
          to="/"
          className="px-5 py-3 text-xs tracking-widest uppercase border border-white/20 hover:bg-white hover:text-black transition"
        >
          Back
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-4xl space-y-12">
        {/* Introduction */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-thin tracking-wider mb-6">What is the I Ching?</h2>
          <div className="space-y-4 text-white/80 leading-relaxed">
            <p>
              The I Ching, or Book of Changes, is one of the oldest Chinese classical texts. Dating back over 3,000 years, 
              it serves as both a divination system and a philosophical guide for understanding the patterns of change in the universe.
            </p>
            <p>
              At its core, the I Ching is based on the concept of yin and yang—the complementary forces that shape all existence. 
              Through the interplay of these forces, sixty-four hexagrams emerge, each representing a unique situation or archetype 
              in the cosmic dance of change.
            </p>
          </div>
        </section>

        {/* The Hexagrams */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-thin tracking-wider mb-6">The 64 Hexagrams</h2>
          <div className="space-y-4 text-white/80 leading-relaxed">
            <p>
              Each hexagram is composed of six lines, either broken (yin) or unbroken (yang). These lines are stacked 
              from bottom to top, creating a unique configuration that represents a specific situation, energy, or teaching.
            </p>
            <p>
              The hexagrams are not static—they contain within them the potential for transformation. When a line is "changing," 
              it indicates movement from one state to another, from yin to yang or yang to yin, revealing how a situation 
              might evolve over time.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs tracking-widest uppercase text-white/60 mb-3">Yang Line</div>
              <div className="h-3 rounded bg-white/90 mb-3"></div>
              <p className="text-sm text-white/70">
                Unbroken line representing active, creative, masculine energy
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs tracking-widest uppercase text-white/60 mb-3">Yin Line</div>
              <div className="flex gap-3 mb-3">
                <div className="h-3 flex-1 rounded bg-white/90"></div>
                <div className="h-3 flex-1 rounded bg-white/90"></div>
              </div>
              <p className="text-sm text-white/70">
                Broken line representing receptive, reflective, feminine energy
              </p>
            </div>
          </div>
        </section>

        {/* The Three-Coin Method */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-thin tracking-wider mb-6">The Three-Coin Method</h2>
          <div className="space-y-4 text-white/80 leading-relaxed">
            <p>
              The traditional three-coin method is a way to consult the I Ching. Three coins are tossed six times, 
              each toss generating one line of the hexagram from bottom to top.
            </p>
            <p>
              Each coin has two sides: heads (yang, value 3) and tails (yin, value 2). The sum of the three coins 
              determines the nature of each line:
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
              <div className="w-12 text-center font-semibold">6</div>
              <div className="text-sm text-white/70">Old Yin (changing) → Transforms to Yang</div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
              <div className="w-12 text-center font-semibold">7</div>
              <div className="text-sm text-white/70">Young Yang → Stable Yang line</div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
              <div className="w-12 text-center font-semibold">8</div>
              <div className="text-sm text-white/70">Young Yin → Stable Yin line</div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
              <div className="w-12 text-center font-semibold">9</div>
              <div className="text-sm text-white/70">Old Yang (changing) → Transforms to Yin</div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-thin tracking-wider mb-6">Philosophy of Change</h2>
          <div className="space-y-4 text-white/80 leading-relaxed">
            <p>
              The I Ching teaches that change is the only constant in the universe. Everything is in a state of flux, 
              moving between extremes, cycling through phases of growth and decline, action and rest.
            </p>
            <p>
              Rather than predicting a fixed future, the I Ching offers wisdom about the present moment and guidance 
              on how to align with the natural flow of change. It encourages reflection, adaptability, and harmony 
              with the Tao—the underlying pattern of existence.
            </p>
            <p>
              By consulting the I Ching, one doesn't seek to control destiny but to understand it, to move with grace 
              through life's transformations, and to find clarity in the midst of uncertainty.
            </p>
          </div>
        </section>

        {/* Call to action */}
        <div className="text-center py-12">
          <div className="h-px w-32 bg-white/20 mx-auto mb-8"></div>
          <Link
            to="/divination"
            className="inline-block px-12 py-4 bg-white text-black text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-gray-200 hover:scale-105"
          >
            Begin Your Consultation
          </Link>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-20"></div>
    </div>
  );
}