'use client';

import { useEffect, useRef } from 'react';

// Echoes the Monjori intro palette
const COOL = { r: 0,   g: 160, b: 210 };  // blue curaçao
const WARM = { r: 200, g: 165, b: 75  };  // warm gold

const EDGE_DIST = 148;
const LANTERN_RADIUS = 210;
const DECAY = 0.962;
const SPREAD = 0.36;
const REVEAL_IN = 0.14;
const REVEAL_OUT = 0.028;

interface Node {
  x: number;   // page coordinates
  y: number;   // page coordinates
  vx: number;
  vy: number;
  energy: number;
  revealed: number;
  warmth: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function nodeColor(node: Node, alpha: number): string {
  const r = Math.round(lerp(COOL.r, WARM.r, node.warmth));
  const g = Math.round(lerp(COOL.g, WARM.g, node.warmth));
  const b = Math.round(lerp(COOL.b, WARM.b, node.warmth));
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function NeuronCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;
    // Mouse in page coordinates
    const mouse = { x: -9999, y: -9999 };
    let nodes: Node[] = [];
    let edges: [number, number, number][] = [];
    let pageH = 0;

    function getPageHeight() {
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      );
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      pageH = getPageHeight();
      init();
    }

    function init() {
      pageH = getPageHeight();
      // Spread nodes across the full page — density ~1 per 14 000 px²
      const area = window.innerWidth * pageH;
      const count = Math.min(Math.max(Math.floor(area / 14000), 50), 160);

      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * pageH,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        energy: 0,
        revealed: 0,
        warmth: Math.random() < 0.35 ? 0.7 + Math.random() * 0.3 : Math.random() * 0.2,
      }));
      buildEdges();
    }

    function buildEdges() {
      edges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < EDGE_DIST) edges.push([i, j, d]);
        }
      }
    }

    function onMouseMove(e: MouseEvent) {
      // Convert to page coordinates
      mouse.x = e.clientX;
      mouse.y = e.clientY + window.scrollY;
    }

    function onClick(e: MouseEvent) {
      const px = e.clientX;
      const py = e.clientY + window.scrollY;
      for (const node of nodes) {
        const dx = node.x - px;
        const dy = node.y - py;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 280) {
          node.energy = Math.max(node.energy, 1 - d / 280);
          node.revealed = Math.max(node.revealed, node.energy);
        }
      }
    }

    function tick() {
      for (const node of nodes) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const target = d < LANTERN_RADIUS ? Math.pow(1 - d / LANTERN_RADIUS, 1.4) : 0;

        if (target > node.revealed) {
          node.revealed += (target - node.revealed) * REVEAL_IN;
        } else {
          node.revealed += (target - node.revealed) * REVEAL_OUT;
        }
        node.revealed = Math.max(node.revealed, node.energy * 0.75);

        if (d < 60) node.energy = Math.max(node.energy, (1 - d / 60) * 0.8);
      }

      for (const [i, j] of edges) {
        const transfer = Math.max(nodes[i].energy, nodes[j].energy) * SPREAD;
        nodes[i].energy = Math.max(nodes[i].energy, transfer);
        nodes[j].energy = Math.max(nodes[j].energy, transfer);
      }

      for (const node of nodes) {
        node.energy *= DECAY;
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        // Wrap vertically within page
        if (node.y < 0) node.y = pageH;
        if (node.y > pageH) node.y = 0;
      }

      if (frame % 90 === 0) buildEdges();
      frame++;
    }

    function draw() {
      const scrollY = window.scrollY;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick();

      // Translate canvas into page space so nodes scroll with the page
      ctx.save();
      ctx.translate(0, -scrollY);

      // Only draw nodes visible in viewport (±EDGE_DIST buffer for edges)
      const top = scrollY - EDGE_DIST;
      const bottom = scrollY + canvas.height + EDGE_DIST;

      for (const [i, j, d] of edges) {
        const ni = nodes[i], nj = nodes[j];
        if (ni.y < top && nj.y < top) continue;
        if (ni.y > bottom && nj.y > bottom) continue;

        const vis = Math.min(ni.revealed, nj.revealed);
        if (vis < 0.01) continue;

        const e = Math.max(ni.energy, nj.energy);
        const fade = 1 - d / EDGE_DIST;
        const alpha = (vis * 0.25 + e * 0.35) * fade;
        const w = (ni.warmth + nj.warmth) / 2;
        const r = Math.round(lerp(COOL.r, WARM.r, w));
        const g = Math.round(lerp(COOL.g, WARM.g, w));
        const b = Math.round(lerp(COOL.b, WARM.b, w));
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = 0.5 + e * 1.0;
        ctx.beginPath();
        ctx.moveTo(ni.x, ni.y);
        ctx.lineTo(nj.x, nj.y);
        ctx.stroke();
      }

      for (const node of nodes) {
        if (node.y < top || node.y > bottom) continue;
        const vis = node.revealed;
        if (vis < 0.01) continue;

        const alpha = vis * 0.18 + node.energy * 0.7;
        const r = 1.6 + node.energy * 3.2 + vis * 0.8;

        if (node.energy > 0.1 || vis > 0.4) {
          const glowAlpha = node.energy * 0.1 + vis * 0.04;
          const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 7);
          glow.addColorStop(0, nodeColor(node, glowAlpha));
          glow.addColorStop(1, nodeColor(node, 0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 7, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = nodeColor(node, Math.min(alpha, 0.85));
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    // Rebuild node count if page height changes after images/fonts load
    window.addEventListener('load', () => {
      if (getPageHeight() !== pageH) init();
    });

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
