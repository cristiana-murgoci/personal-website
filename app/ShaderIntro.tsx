'use client';

import { useEffect, useRef, useState } from 'react';

// Raw WebGL — no Three.js needed for a fullscreen quad shader
const VERT = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Monjori by Mic — modified with zoom uniform for the fall-in effect
const FRAG = `
  precision mediump float;
  varying vec2 vUv;
  uniform float time;
  uniform float zoom;

  void main() {
    vec2 pFull = -1.0 + 2.0 * vUv;
    vec2 p = pFull / max(zoom, 0.001);

    float a = time * 40.0;
    float d, e, f, g = 1.0 / 40.0, h, i, r, q;

    e = 400.0 * (p.x * 0.5 + 0.5);
    f = 400.0 * (p.y * 0.5 + 0.5);
    i = 200.0 + sin(e * g + a / 150.0) * 20.0;
    d = 200.0 + cos(f * g / 2.0) * 18.0 + cos(e * g) * 7.0;
    r = sqrt(pow(abs(i - e), 2.0) + pow(abs(d - f), 2.0));
    q = f / r;
    e = (r * cos(q)) - a / 2.0;
    f = (r * sin(q)) - a / 2.0;
    d = sin(e * g) * 176.0 + sin(e * g) * 164.0 + r;
    h = ((f + d) + a / 2.0) * g;
    i = cos(h + r * pFull.x / 1.3) * (e + e + a) + cos(q * g * 6.0) * (r + h / 3.0);
    h = sin(f * g) * 144.0 - sin(e * g) * 212.0 * pFull.x;
    h = (h + (f - e) * q + sin(r - (a + h) / 7.0) * 10.0 + i / 4.0) * g;
    i += cos(h * 2.3 * sin(a / 350.0 - q)) * 184.0
       * sin(q - (r * 4.3 + a / 12.0) * g)
       + tan(r * g + h) * 184.0 * cos(r * g + h);
    i = mod(i / 5.6, 256.0) / 64.0;
    if (i < 0.0) i += 4.0;
    if (i >= 2.0) i = 4.0 - i;
    d = r / 350.0;
    d += sin(d * d * 8.0) * 0.52;
    f = (sin(a * g) + 1.0) / 2.0;

    // Original Monjori — used for luminance/structure only
    vec3 raw =
      vec3(f * i / 1.6, i / 2.0 + d / 13.0, i) * d * pFull.x +
      vec3(i / 1.3 + d / 8.0, i / 2.0 + d / 18.0, i) * d * (1.0 - pFull.x);

    float lum = clamp(dot(raw, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);

    vec3 c0 = vec3(0.02, 0.06, 0.10);   // void — deep ocean black
    vec3 c1 = vec3(0.02, 0.18, 0.28);   // deep petrol
    vec3 c2 = vec3(0.00, 0.38, 0.58);   // ocean depth
    vec3 c3 = vec3(0.00, 0.62, 0.82);   // blue curaçao
    vec3 c4 = vec3(0.05, 0.84, 0.94);   // electric caribbean blue
    vec3 c5 = vec3(0.83, 0.67, 0.33);   // gold veins — brightest only

    vec3 color;
    if      (lum < 0.20) color = mix(c0, c1, lum / 0.20);
    else if (lum < 0.40) color = mix(c1, c2, (lum - 0.20) / 0.20);
    else if (lum < 0.60) color = mix(c2, c3, (lum - 0.40) / 0.20);
    else if (lum < 0.80) color = mix(c3, c4, (lum - 0.60) / 0.20);
    else                 color = mix(c4, c5, (lum - 0.80) / 0.20);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export default function ShaderIntro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const zoomUniform = useRef<WebGLUniformLocation | null>(null);
  const timeUniform = useRef<WebGLUniformLocation | null>(null);
  const animRef = useRef<number>(0);
  const touchStartY = useRef(0);

  const [shaderOpacity, setShaderOpacity] = useState(1);
  const [textOpacity, setTextOpacity] = useState(0);
  const [gone, setGone] = useState(false);

  // Prevent browser scroll restoration so intro always starts at top
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  // WebGL setup — runs once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    zoomUniform.current = gl.getUniformLocation(prog, 'zoom');
    timeUniform.current = gl.getUniformLocation(prog, 'time');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    function render() {
      // Quadratic ease — slow appreciation, fast fall
      const eased = progressRef.current * progressRef.current;
      const zoom = 1.0 + eased * 26.0;
      gl.uniform1f(zoomUniform.current!, zoom);
      gl.uniform1f(timeUniform.current!, performance.now() / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animRef.current = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Scroll/wheel/touch capture — drives the fall
  useEffect(() => {
    if (gone) return;

    function advance(delta: number) {
      progressRef.current = Math.min(progressRef.current + delta, 1);
      const p = progressRef.current;

      // Name fades in as void expands (progress 0.3 → 0.6)
      setTextOpacity(Math.max(0, Math.min(1, (p - 0.30) / 0.30)));

      // Shader fades out in final fifth
      if (p > 0.65) {
        setShaderOpacity(1 - (p - 0.65) / 0.35);
      }

      if (p >= 1) {
        setGone(true);
        window.dispatchEvent(new Event('intro:complete'));
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      advance(Math.abs(e.deltaY) / 700);
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY.current = e.touches[0].clientY;
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const dy = touchStartY.current - e.touches[0].clientY;
      touchStartY.current = e.touches[0].clientY;
      advance(Math.abs(dy) / 300);
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [gone]);

  if (gone) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: '#0c0c0b',
        opacity: shaderOpacity,
        transition: 'opacity 0.25s ease',
        pointerEvents: gone ? 'none' : 'all',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />

    </div>
  );
}
