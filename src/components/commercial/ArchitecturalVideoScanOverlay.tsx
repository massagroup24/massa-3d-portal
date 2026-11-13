import { useEffect, useRef, type RefObject } from 'react';

interface ArchitecturalVideoScanOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  active?: boolean;
  accentHex?: string;
}

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    v_uv.y = 1.0 - v_uv.y;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision mediump float;

  uniform sampler2D u_video;
  uniform vec2 u_canvasSize;
  uniform vec2 u_videoSize;
  uniform float u_scanProgress; // -1.0 = inactivo, 0.0..1.15 = barrido activo en la toma actual
  uniform vec3 u_accentColor;

  varying vec2 v_uv;

  // Mapeo exacto equivalente a CSS object-cover object-center
  vec2 getCoverUV(vec2 uv, vec2 canvasSize, vec2 videoSize) {
    float canvasAspect = canvasSize.x / max(canvasSize.y, 1.0);
    float videoAspect = videoSize.x / max(videoSize.y, 1.0);
    vec2 scale = vec2(1.0);
    if (canvasAspect > videoAspect) {
      scale.y = videoAspect / canvasAspect;
    } else {
      scale.x = canvasAspect / videoAspect;
    }
    return (uv - 0.5) * scale + 0.5;
  }

  float luminance(vec3 c) {
    return dot(c, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vec2 coverUV = getCoverUV(v_uv, u_canvasSize, u_videoSize);

    if (coverUV.x < 0.0 || coverUV.x > 1.0 || coverUV.y < 0.0 || coverUV.y > 1.0) {
      gl_FragColor = vec4(0.0);
      return;
    }

    // Paso de muestreo nítido para detectar aristas arquitectónicas reales
    vec2 texel = 1.15 / max(u_videoSize, vec2(1.0));

    float tl = luminance(texture2D(u_video, coverUV + vec2(-texel.x, -texel.y)).rgb);
    float t  = luminance(texture2D(u_video, coverUV + vec2(0.0, -texel.y)).rgb);
    float tr = luminance(texture2D(u_video, coverUV + vec2(texel.x, -texel.y)).rgb);
    float l  = luminance(texture2D(u_video, coverUV + vec2(-texel.x, 0.0)).rgb);
    float r  = luminance(texture2D(u_video, coverUV + vec2(texel.x, 0.0)).rgb);
    float bl = luminance(texture2D(u_video, coverUV + vec2(-texel.x, texel.y)).rgb);
    float b  = luminance(texture2D(u_video, coverUV + vec2(0.0, texel.y)).rgb);
    float br = luminance(texture2D(u_video, coverUV + vec2(texel.x, texel.y)).rgb);

    // Operador Sobel para contornos estructurales (ventanales, vigas, mármol, carpintería)
    float gx = -tl - 2.0 * l - bl + tr + 2.0 * r + br;
    float gy = -tl - 2.0 * t - tr + bl + 2.0 * b + br;
    float edge = sqrt(gx * gx + gy * gy);

    // Umbral selectivo para evitar ruido y resaltar solo líneas definidas
    float crispEdge = smoothstep(0.09, 0.35, edge);
    float strongStructure = smoothstep(0.20, 0.52, edge);

    float diagCoord = v_uv.x * 0.85 + v_uv.y * 0.15;

    float scanWake = 0.0;
    float scanLaserLine = 0.0;
    if (u_scanProgress >= 0.0 && u_scanProgress <= 1.2) {
      float distBehindScan = (u_scanProgress * 1.35 - 0.12) - diagCoord;
      scanWake = smoothstep(0.0, 0.025, distBehindScan) * (1.0 - smoothstep(0.025, 0.30, distBehindScan));
      scanLaserLine = exp(-abs(distBehindScan) * 140.0) * (1.0 - smoothstep(0.95, 1.15, u_scanProgress));
    }

    // Trazado base muy sutil en aristas principales + iluminación intensa al iniciar cada toma
    float ambientWire = strongStructure * 0.07;
    float scannedWire = crispEdge * scanWake * 0.95;
    float laserEdgeBoost = crispEdge * scanLaserLine * 1.2;

    float intensity = clamp(ambientWire + scannedWire + laserEdgeBoost, 0.0, 1.0);

    vec3 brightCore = vec3(0.894, 1.0, 0.541);
    vec3 lineColor = mix(u_accentColor, brightCore, smoothstep(0.32, 0.95, intensity));
    vec3 beamColor = mix(lineColor, brightCore, 0.65) * (scanLaserLine * 0.22);

    vec3 finalRgb = lineColor * intensity + beamColor;
    float finalAlpha = clamp(intensity * 0.88 + scanLaserLine * 0.18, 0.0, 0.95);

    gl_FragColor = vec4(finalRgb, finalAlpha);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function hexToNormalizedRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return [0.612, 0.816, 0.102];
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
}

// Duración ágil de cada barrido al cambiar de toma (2.15 segundos)
const SCAN_DURATION_MS = 2150;
// Cooldown mínimo entre detecciones de corte para evitar dobles disparos en transiciones rápidas
const CUT_COOLDOWN_MS = 950;
// Si una toma dura más de 7s sin cortes, lanzar un escaneo preventivo suave
const FALLBACK_RESCAN_MS = 7000;

/**
 * Capa WebGL en tiempo real sobre el video Hero:
 * 1. Detecta automáticamente cada cambio de toma (corte o transición) analizando una miniatura 16x9 del video.
 * 2. Dispara de inmediato el barrido láser arquitectónico BIM sobre la nueva toma (2.15s).
 */
export function ArchitecturalVideoScanOverlay({
  videoRef,
  active = true,
  accentHex = '#9CD01A',
}: ArchitecturalVideoScanOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      premultipliedAlpha: true,
    });
    if (!gl) return;

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const uVideoLoc = gl.getUniformLocation(program, 'u_video');
    const uCanvasSizeLoc = gl.getUniformLocation(program, 'u_canvasSize');
    const uVideoSizeLoc = gl.getUniformLocation(program, 'u_videoSize');
    const uScanProgressLoc = gl.getUniformLocation(program, 'u_scanProgress');
    const uAccentLoc = gl.getUniformLocation(program, 'u_accentColor');

    gl.uniform1i(uVideoLoc, 0);
    const [ar, ag, ab] = hexToNormalizedRgb(accentHex);
    gl.uniform3f(uAccentLoc, ar, ag, ab);

    // Canvas miniatura 16x9 para detección ultrarrápida de cambio de toma (~144 píxeles)
    const probeW = 16;
    const probeH = 9;
    const probeCanvas = document.createElement('canvas');
    probeCanvas.width = probeW;
    probeCanvas.height = probeH;
    const probeCtx = probeCanvas.getContext('2d', { willReadFrequently: true });

    // Historial circular de 4 fotogramas (~130ms) para detectar tanto cortes secos como fundidos rápidos
    const historyLen = 4;
    const frameHistory: Uint8ClampedArray[] = [];
    let prevVideoTime = -1;
    let lastTriggerAt = performance.now();
    let scanStartAt = performance.now();
    let lastProbeAt = 0;

    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const isMobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.35);
      const w = Math.max(1, Math.floor(parent.clientWidth * dpr));
      const h = Math.max(1, Math.floor(parent.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize, { passive: true });

    let rafId = 0;

    const render = (now: number) => {
      rafId = requestAnimationFrame(render);
      if (document.hidden) return;

      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      // 1. Detectar reinicio/loop del video
      if (prevVideoTime > 0 && video.currentTime < prevVideoTime - 0.4) {
        scanStartAt = now;
        lastTriggerAt = now;
        frameHistory.length = 0;
      }
      prevVideoTime = video.currentTime;

      // 2. Detectar cambio de toma en tiempo real cada ~45ms
      if (probeCtx && now - lastProbeAt >= 45) {
        lastProbeAt = now;
        try {
          probeCtx.drawImage(video, 0, 0, probeW, probeH);
          const pixels = probeCtx.getImageData(0, 0, probeW, probeH).data;

          if (frameHistory.length > 0 && now - lastTriggerAt >= CUT_COOLDOWN_MS) {
            // Comparar contra el frame inmediatamente anterior (corte seco)
            const prevFrame = frameHistory[frameHistory.length - 1];
            let diffImmediate = 0;
            for (let i = 0; i < pixels.length; i += 4) {
              diffImmediate +=
                Math.abs(pixels[i] - prevFrame[i]) +
                Math.abs(pixels[i + 1] - prevFrame[i + 1]) +
                Math.abs(pixels[i + 2] - prevFrame[i + 2]);
            }
            const madImmediate = diffImmediate / (probeW * probeH * 3 * 255);

            // Comparar contra ~180ms atrás (transición/fundido rápido)
            const olderFrame = frameHistory[0];
            let diffWindow = 0;
            for (let i = 0; i < pixels.length; i += 4) {
              diffWindow +=
                Math.abs(pixels[i] - olderFrame[i]) +
                Math.abs(pixels[i + 1] - olderFrame[i + 1]) +
                Math.abs(pixels[i + 2] - olderFrame[i + 2]);
            }
            const madWindow = diffWindow / (probeW * probeH * 3 * 255);

            if (madImmediate > 0.115 || madWindow > 0.185) {
              scanStartAt = now;
              lastTriggerAt = now;
              frameHistory.length = 0;
            }
          }

          frameHistory.push(new Uint8ClampedArray(pixels));
          if (frameHistory.length > historyLen) {
            frameHistory.shift();
          }
        } catch {
          // Ignorar errores de lectura de canvas
        }
      }

      // 3. Fallback suave si una misma toma dura mucho sin cortes
      if (now - lastTriggerAt >= FALLBACK_RESCAN_MS) {
        scanStartAt = now;
        lastTriggerAt = now;
      }

      const elapsedScan = now - scanStartAt;
      const scanProgress =
        elapsedScan <= SCAN_DURATION_MS ? (elapsedScan / SCAN_DURATION_MS) * 1.15 : -1.0;

      updateCanvasSize();

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      } catch {
        return;
      }

      gl.uniform2f(uCanvasSizeLoc, canvas.width, canvas.height);
      gl.uniform2f(uVideoSizeLoc, video.videoWidth, video.videoHeight);
      gl.uniform1f(uScanProgressLoc, scanProgress);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateCanvasSize);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [active, accentHex, videoRef]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full transform scale-[1.01] mix-blend-screen opacity-90"
    />
  );
}

export default ArchitecturalVideoScanOverlay;
