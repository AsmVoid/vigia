"use client";

import * as React from "react";

interface ShaderBackgroundProps {
  pattern?: "wave" | "premium" | "ethereal";
  dotSize?: number;
  spacing?: number;
  speed?: number;
  angle?: number;
  className?: string;
}

export function ShaderBackground({
  pattern = "premium",
  dotSize = 35,
  spacing = 2,
  speed = 0.85,
  angle = 45,
  className = "",
}: ShaderBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        powerPreference: "high-performance",
      }) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) return;

    // Fullscreen quad vertex shader
    const vsSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Premium Flow Fragment Shader with IG (Instagram) Gradient Colors
    const fsSource = `
      precision highp float;

      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec3 uBgColor;
      uniform float uAngle;
      uniform int uPattern;
      uniform float uDotSize;
      uniform float uSpacing;
      uniform float uSpeed;

      // Standard 2D Simplex Noise from Framer Premium Shader
      vec3 permute(vec3 x) {
        return mod(((x * 34.0) + 1.0) * x, 289.0);
      }

      float snoise(vec2 v) {
        const vec4 C = vec4(
          0.211324865405187,
          0.366025403784439,
          -0.577350269189626,
          0.024390243902439
        );
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      mat2 rotate(float a) {
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
      }

      void main() {
        vec2 p = gl_FragCoord.xy / uResolution.xy;
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 uv = (p - 0.5) * aspect;

        uv = rotate(uAngle * 3.14159265 / 180.0) * uv;

        float density = uSpacing * 48.0;
        vec2 gridPos = uv * density;
        vec2 cell = fract(gridPos) - 0.5;
        vec2 id = floor(gridPos);

        float time = uTime * uSpeed;
        float patternValue = 0.0;

        if (uPattern == 0) {
          // Pattern 0: Sine Wave Matrix
          float wave1 = sin(id.x * 0.1 + time) * 0.5 + 0.5;
          float wave2 = cos(id.y * 0.1 - time * 0.8) * 0.5 + 0.5;
          float wave3 = sin((id.x + id.y) * 0.05 + time * 1.2) * 0.5 + 0.5;
          patternValue = (wave1 + wave2 + wave3) / 3.0;
          patternValue += snoise(id * 0.05 + time * 0.2) * 0.2;
        } else if (uPattern == 1) {
          // Pattern 1: Premium Aura Flow
          vec2 npos = id * 0.02;
          float n1 = snoise(npos + time * 0.3);
          float n2 = snoise(npos * 1.5 - time * 0.2 + n1);
          float flow = sin(id.x * 0.05 + n2 * 3.0 + time) * cos(id.y * 0.05 + n1 * 2.0 - time);
          patternValue = smoothstep(-0.5, 0.5, flow);
          patternValue = pow(patternValue, 1.5);
        } else {
          // Pattern 2: Ethereal Quantum Threads
          float t = time * 0.5;
          vec2 q = vec2(
            snoise(id * 0.015 + vec2(t, t)),
            snoise(id * 0.015 + vec2(-t, t))
          );
          vec2 r = vec2(
            snoise(id * 0.02 + q + vec2(t * 1.5, -t)),
            snoise(id * 0.02 + q + vec2(-t, t * 1.2))
          );
          float f = snoise(id * 0.03 + r);
          patternValue = smoothstep(0.1, 0.9, f * 0.5 + 0.5);
          patternValue *= mix(0.5, 1.0, sin(id.x * 0.1 + id.y * 0.1 + time * 2.0) * 0.5 + 0.5);
        }

        patternValue = clamp(patternValue, 0.0, 1.0);
        float maxRadius = (uDotSize / 100.0) * 0.5;
        float currentRadius = maxRadius * patternValue;

        float dist = length(cell);
        float alpha = smoothstep(currentRadius + 0.05, currentRadius - 0.01, dist);

        // App Instagram Gradient Palette
        // #833ab4 (purple) -> #c13584 (magenta) -> #e1306c (pink) -> #fd1d1d (red) -> #f77737 (amber) -> #fcaf45 (gold)
        vec3 cPurple  = vec3(0.514, 0.227, 0.706);
        vec3 cMagenta = vec3(0.757, 0.208, 0.518);
        vec3 cPink    = vec3(0.882, 0.188, 0.424);
        vec3 cRed     = vec3(0.992, 0.114, 0.114);
        vec3 cOrange  = vec3(0.969, 0.467, 0.216);
        vec3 cGold    = vec3(0.988, 0.686, 0.271);

        float gradPos = clamp((p.x * 0.55 + (1.0 - p.y) * 0.45) + patternValue * 0.25 - 0.1, 0.0, 1.0);
        vec3 dotColor = cPurple;
        dotColor = mix(dotColor, cMagenta, smoothstep(0.00, 0.20, gradPos));
        dotColor = mix(dotColor, cPink,    smoothstep(0.20, 0.40, gradPos));
        dotColor = mix(dotColor, cRed,     smoothstep(0.40, 0.65, gradPos));
        dotColor = mix(dotColor, cOrange,  smoothstep(0.65, 0.85, gradPos));
        dotColor = mix(dotColor, cGold,    smoothstep(0.85, 1.00, gradPos));

        // Seamless dot mixing onto background
        vec3 finalColor = mix(uBgColor, dotColor, alpha * patternValue);

        // Ambient atmospheric flow glow in the dark background
        finalColor += dotColor * (patternValue * 0.09);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function createShader(type: number, source: string) {
      if (!gl) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad geometry: two triangles covering clip space [-1, 1]
    const quadVertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const aPositionLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uResolutionLoc = gl.getUniformLocation(program, "uResolution");
    const uBgColorLoc = gl.getUniformLocation(program, "uBgColor");
    const uAngleLoc = gl.getUniformLocation(program, "uAngle");
    const uPatternLoc = gl.getUniformLocation(program, "uPattern");
    const uDotSizeLoc = gl.getUniformLocation(program, "uDotSize");
    const uSpacingLoc = gl.getUniformLocation(program, "uSpacing");
    const uSpeedLoc = gl.getUniformLocation(program, "uSpeed");

    // Static uniforms
    const patternId = pattern === "wave" ? 0 : pattern === "premium" ? 1 : 2;
    gl.uniform1i(uPatternLoc, patternId);
    gl.uniform1f(uDotSizeLoc, dotSize);
    gl.uniform1f(uSpacingLoc, spacing);
    gl.uniform1f(uSpeedLoc, speed);
    gl.uniform1f(uAngleLoc, angle);

    // Deep dark background color (rgb: 0.02, 0.02, 0.027) matching theme
    gl.uniform3f(uBgColorLoc, 0.02, 0.02, 0.027);

    let animationFrameId: number;
    let startTime = performance.now();

    function resize() {
      if (!canvas || !gl) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener("resize", resize);

    function render(currentTime: number) {
      if (!gl) return;
      const elapsed = (currentTime - startTime) * 0.001;
      gl.uniform1f(uTimeLoc, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteBuffer(vertexBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      }
    };
  }, [pattern, dotSize, spacing, speed, angle]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#050507] ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-90 transition-opacity duration-1000"
      />
      {/* Subtle vignette border gradient overlay to soften edges */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
    </div>
  );
}
