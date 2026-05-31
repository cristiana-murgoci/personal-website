'use client';

const TOTAL  = 320;
const MARGIN = 58;
const DIE    = TOTAL - MARGIN * 2; // 204px

const PINS = 9;
const PIN_W = 5;
const PIN_H = 14;

function pinOffsets(): number[] {
  const span = DIE - PINS * PIN_W;
  const gap  = span / (PINS + 1);
  return Array.from({ length: PINS }, (_, i) => MARGIN + gap * (i + 1) + PIN_W * i);
}

const offs = pinOffsets();
const pinGlow = '0 0 5px rgba(0,160,212,0.9), 0 0 12px rgba(0,160,212,0.5)';

// A handful of hand-placed PCB traces (from edge → out)
const traces = [
  // top side
  `M ${MARGIN + 20} ${MARGIN - 4} L ${MARGIN + 20} 12 L ${MARGIN - 10} 12 L ${MARGIN - 10} 0`,
  `M ${MARGIN + DIE / 2} ${MARGIN - 4} L ${MARGIN + DIE / 2} 0`,
  `M ${MARGIN + DIE - 20} ${MARGIN - 4} L ${MARGIN + DIE - 20} 18 L ${MARGIN + DIE + 12} 18`,
  // bottom side
  `M ${MARGIN + 30} ${MARGIN + DIE + 4} L ${MARGIN + 30} ${TOTAL - 12} L ${MARGIN - 8} ${TOTAL - 12}`,
  `M ${MARGIN + DIE / 2} ${MARGIN + DIE + 4} L ${MARGIN + DIE / 2} ${TOTAL}`,
  `M ${MARGIN + DIE - 30} ${MARGIN + DIE + 4} L ${MARGIN + DIE - 30} ${TOTAL - 18} L ${MARGIN + DIE + 10} ${TOTAL - 18}`,
  // left side
  `M ${MARGIN - 4} ${MARGIN + 25} L 14 ${MARGIN + 25} L 14 ${MARGIN - 8}`,
  `M ${MARGIN - 4} ${MARGIN + DIE / 2} L 0 ${MARGIN + DIE / 2}`,
  `M ${MARGIN - 4} ${MARGIN + DIE - 25} L 14 ${MARGIN + DIE - 25} L 14 ${MARGIN + DIE + 8}`,
  // right side
  `M ${MARGIN + DIE + 4} ${MARGIN + 25} L ${TOTAL - 14} ${MARGIN + 25} L ${TOTAL - 14} ${MARGIN - 8}`,
  `M ${MARGIN + DIE + 4} ${MARGIN + DIE / 2} L ${TOTAL} ${MARGIN + DIE / 2}`,
  `M ${MARGIN + DIE + 4} ${MARGIN + DIE - 25} L ${TOTAL - 14} ${MARGIN + DIE - 25} L ${TOTAL - 14} ${MARGIN + DIE + 8}`,
];

export default function ChipPhoto() {
  return (
    <div style={{ position: 'relative', width: TOTAL, height: TOTAL, flexShrink: 0, overflow: 'hidden' }}>

      {/* Circuit traces */}
      <svg
        width={TOTAL} height={TOTAL}
        style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}
      >
        <defs>
          <filter id="traceGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <style>{`
            .trace {
              fill: none;
              stroke: rgba(0,160,212,0.55);
              stroke-width: 1.2;
              stroke-dasharray: 6 3;
              animation: flow 2.4s linear infinite;
            }
            .trace:nth-child(2n) { animation-delay: -1.2s; }
            .trace:nth-child(3n) { animation-delay: -0.6s; }
            @keyframes flow {
              from { stroke-dashoffset: 18; }
              to   { stroke-dashoffset: 0; }
            }
          `}</style>
        </defs>
        {traces.map((d, i) => (
          <path key={i} className="trace" d={d} filter="url(#traceGlow)" />
        ))}
      </svg>

      {/* Top pins */}
      {offs.map((x, i) => (
        <span key={`t${i}`} style={{ position: 'absolute', left: x, top: MARGIN - PIN_H - 2, width: PIN_W, height: PIN_H, background: 'var(--accent)', boxShadow: pinGlow }} />
      ))}
      {/* Bottom pins */}
      {offs.map((x, i) => (
        <span key={`b${i}`} style={{ position: 'absolute', left: x, top: MARGIN + DIE + 2, width: PIN_W, height: PIN_H, background: 'var(--accent)', boxShadow: pinGlow }} />
      ))}
      {/* Left pins */}
      {offs.map((y, i) => (
        <span key={`l${i}`} style={{ position: 'absolute', top: y, left: MARGIN - PIN_H - 2, height: PIN_W, width: PIN_H, background: 'var(--accent)', boxShadow: pinGlow }} />
      ))}
      {/* Right pins */}
      {offs.map((y, i) => (
        <span key={`r${i}`} style={{ position: 'absolute', top: y, left: MARGIN + DIE + 2, height: PIN_W, width: PIN_H, background: 'var(--accent)', boxShadow: pinGlow }} />
      ))}

      {/* Die — outer provides teal border via background, clip-path clips photo naturally */}
      <div style={{
        position: 'absolute',
        inset: MARGIN,
        background: 'var(--accent)',
        clipPath: 'polygon(10px 0%,calc(100% - 10px) 0%,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0% calc(100% - 10px),0% 10px)',
        padding: 2,
        zIndex: 2,
      }}>
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          <img
            src="/headshot.jpg"
            alt="Cristiana Murgoci"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%', filter: 'grayscale(10%) contrast(1.04)', display: 'block' }}
          />
        </div>
      </div>

      {/* Chip label */}
      <span style={{
        position: 'absolute',
        bottom: MARGIN + 8,
        right: MARGIN + 8,
        fontFamily: 'var(--font-mono), Space Mono, monospace',
        fontSize: 7,
        letterSpacing: '0.1em',
        color: 'var(--accent)',
        opacity: 0.5,
        zIndex: 3,
        userSelect: 'none',
      }}>
        CM·01
      </span>
    </div>
  );
}
