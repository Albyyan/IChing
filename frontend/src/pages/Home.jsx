import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ZenBackground from "../components/ZenBackground.jsx";
import yijing from "../assets/yijing.png";

export default function Home() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime((p) => p + 0.05), 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      <ZenBackground time={time} />

      <div className="absolute inset-0 bg-black">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            {/* Animated gradient for flowing effect */}
            <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0.15">
                <animate attributeName="offset" values="0;1;0" dur="8s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="white" stopOpacity="0.3">
                <animate attributeName="offset" values="0.5;1;0.5" dur="8s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="white" stopOpacity="0.15">
                <animate attributeName="offset" values="1;0;1" dur="8s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>

          {/* Animated concentric circles - zen garden pattern */}
          {[...Array(8)].map((_, i) => {
            const radius = 80 + i * 60;
            const delay = i * 0.5;
            return (
              <circle
                key={`circle-${i}`}
                cx="50%"
                cy="40%"
                r={radius + Math.sin(time + delay) * 20}
                fill="none"
                stroke="white"
                strokeWidth="1"
                opacity={0.15 - i * 0.015}
                style={{
                  transition: 'r 0.3s ease-out'
                }}
              />
            );
          })}

          {/* Flowing curved lines */}
          {[...Array(12)].map((_, i) => {
            const y = 10 + i * 8;
            const amplitude = 30 + Math.sin(time + i * 0.5) * 10;
            const offset = Math.sin(time * 0.5 + i * 0.3) * 50;
            
            return (
              <path
                key={`wave-${i}`}
                d={`M ${-20 + offset} ${y}% Q ${25 + offset} ${y - amplitude}% ${50 + offset} ${y}% T ${120 + offset} ${y}%`}
                fill="none"
                stroke="url(#flow-gradient)"
                strokeWidth="2"
                opacity={0.2 - i * 0.01}
              />
            );
          })}

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => {
            const x = (i * 5) % 100;
            const baseY = (i * 7) % 100;
            const y = baseY + Math.sin(time + i) * 3;
            
            return (
              <circle
                key={`particle-${i}`}
                cx={`${x}%`}
                cy={`${y}%`}
                r={i % 2 === 0 ? 2 : 1}
                fill="white"
                opacity={0.3}
              />
            );
          })}
        </svg>
      </div>

      {/* Chinese Characters — centered, nudged up */}
      <div className="absolute inset-0 z-10 flex items-center justify-center -translate-y-8">
        <img
          src={yijing}
          alt="I Ching Characters"
          className="w-[500px] md:w-[450px] sm:w-[300px] opacity-60"
          style={{
            transform: `scale(${1 + Math.sin(time * 0.5) * 0.05})`,
            filter: "brightness(10) contrast(1.2)",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* Pulsing accent circles */}
      <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full border-2 border-white opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-1/3 left-1/4 w-20 h-20 rounded-full border border-white opacity-10 animate-pulse-slower"></div>

      {/* Content at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center text-center pb-32 px-8">
        <h1 className="text-7xl md:text-8xl lg:text-9xl font-thin tracking-wider mb-6 leading-none animate-fade-in">
          <span className="text-white">I </span>
          <span className="text-white opacity-50">C</span>
          <span className="text-white">HING</span>
        </h1>
        
        <div className="h-px w-32 bg-white mx-auto mb-6 animate-expand"></div>
        
        <p className="text-sm md:text-base font-light tracking-widest text-gray-400 mb-8 animate-fade-in-delay uppercase">
          In perpetual motion
        </p>
        
        <div className="flex justify-center gap-6 animate-fade-in-delay-2">
          <Link to="/divination"
            className="px-10 py-4 bg-white text-black text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-gray-200 hover:scale-105"
          >
            Enter
          </Link>
          <Link 
            to="/introduction" 
            className="px-10 py-4 border-2 border-white text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-white hover:text-black hover:scale-105"
          >
            Discover
          </Link>
        </div>
      </div>

      {/* Minimal footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-600 z-20 tracking-widest">
        © 2026 FLOW STUDIO
      </div>

      {/* Side text */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
        <p className="text-xs text-gray-600 tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          HARMONY • CONTRAST • MOTION
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expand {
          from {
            width: 0;
          }
          to {
            width: 8rem;
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.1;
          }
        }

        @keyframes pulse-slower {
          0%, 100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.05;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-fade-in-delay {
          opacity: 0;
          animation: fade-in 1s ease-out 0.3s forwards;
        }

        .animate-fade-in-delay-2 {
          opacity: 0;
          animation: fade-in 1s ease-out 0.6s forwards;
        }

        .animate-expand {
          animation: expand 1.5s ease-out 0.5s forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite 1s;
        }
      `}</style>
    </div>
  );
}