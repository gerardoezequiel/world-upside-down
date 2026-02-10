/* ══════════════════════════════════════════════════════════════
   Dither Globe — WebGL Bayer-dithered world map background
   Morphs between south-up projections with riso ink colors.
   Replaces the abstract FBM noise dither with actual geography.
   ══════════════════════════════════════════════════════════════ */

import { generateProjectionTextures, type ProjectionTexture } from './globe-textures';

declare const THREE: any; // Loaded from CDN

/* ── Shader source ── */

const vertexShader = `void main() { gl_Position = vec4(position, 1.0); }`;

const fragmentShader = `
precision highp float;

uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;

// Map textures & morphing
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float     uMorph;       // 0→1 transition progress
uniform vec3      uColorA;      // current ink RGB
uniform vec3      uColorB;      // next ink RGB
uniform float     uRotAngle;    // slow rotation
uniform vec2      uTexSizeA;    // texture dimensions A
uniform vec2      uTexSizeB;    // texture dimensions B

// Mouse interaction
uniform vec2  uMouse;
uniform float uMouseActive;

// Click ripples
#define MAX_CLICKS 10
uniform vec2  uClickPos[MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

/* ── Bayer 8×8 ordered dither ── */
float Bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
#define Bayer4(a) (Bayer2(0.5 * (a)) * 0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(0.5 * (a)) * 0.25 + Bayer2(a))

/* ── Noise for scatter effect ── */
float hash11(float n) { return fract(sin(n) * 43758.5453); }

float vnoise(vec3 p) {
  vec3 ip = floor(p); vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0,0,0), vec3(1,57,113)));
  float n100 = hash11(dot(ip + vec3(1,0,0), vec3(1,57,113)));
  float n010 = hash11(dot(ip + vec3(0,1,0), vec3(1,57,113)));
  float n110 = hash11(dot(ip + vec3(1,1,0), vec3(1,57,113)));
  float n001 = hash11(dot(ip + vec3(0,0,1), vec3(1,57,113)));
  float n101 = hash11(dot(ip + vec3(1,0,1), vec3(1,57,113)));
  float n011 = hash11(dot(ip + vec3(0,1,1), vec3(1,57,113)));
  float n111 = hash11(dot(ip + vec3(1,1,1), vec3(1,57,113)));
  vec3 w = fp * fp * fp * (fp * (fp * 6.0 - 15.0) + 10.0);
  float x00 = mix(n000, n100, w.x); float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x); float x11 = mix(n011, n111, w.x);
  float y0 = mix(x00, x10, w.y); float y1 = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

/* ── FBM for subtle organic movement ── */
float fbm(vec2 uv, float t) {
  vec3 p = vec3(uv * 2.5, t);
  float amp = 1.0; float freq = 1.0; float sum = 0.0;
  for (int i = 0; i < 3; i++) {
    sum += amp * vnoise(p * freq);
    freq *= 1.5;
    amp *= 0.5;
  }
  return sum * 0.5 + 0.5;
}

/* ── 2D rotation ── */
vec2 rotate2D(vec2 p, float a) {
  float c = cos(a); float s = sin(a);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

/* ── Circular halftone mask ── */
float maskCircle(vec2 p, float cov) {
  float r = sqrt(cov) * 0.3;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

void main() {
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * 0.5;
  float aspect = uResolution.x / uResolution.y;

  // Grid cells for dithering
  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);
  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspect, 1.0);

  // ── UV for texture sampling with slow rotation + breathing ──
  vec2 screenUV = (gl_FragCoord.xy) / uResolution;
  
  // Scale breathing
  float breathe = 1.0 + sin(uTime * 0.25) * 0.02;
  
  // Apply rotation around center
  vec2 centeredUV = screenUV - 0.5;
  centeredUV = rotate2D(centeredUV, uRotAngle);
  centeredUV *= breathe;
  vec2 rotatedUV = centeredUV + 0.5;

  // ── Sample map textures ──
  // Handle different aspect ratios - contain within screen
  vec2 texUV_A = rotatedUV;
  vec2 texUV_B = rotatedUV;
  
  // Adjust for texture aspect ratio vs screen aspect ratio
  float texAspectA = uTexSizeA.x / uTexSizeA.y;
  float texAspectB = uTexSizeB.x / uTexSizeB.y;
  float screenAspect = uResolution.x / uResolution.y;
  
  // Fit texture (contain)
  if (screenAspect > texAspectA) {
    float scale = texAspectA / screenAspect;
    texUV_A.x = (texUV_A.x - 0.5) / scale + 0.5;
  } else {
    float scale = screenAspect / texAspectA;
    texUV_A.y = (texUV_A.y - 0.5) / scale + 0.5;
  }
  
  if (screenAspect > texAspectB) {
    float scale = texAspectB / screenAspect;
    texUV_B.x = (texUV_B.x - 0.5) / scale + 0.5;
  } else {
    float scale = screenAspect / texAspectB;
    texUV_B.y = (texUV_B.y - 0.5) / scale + 0.5;
  }

  float mapA = texture2D(uTexA, texUV_A).r;
  float mapB = texture2D(uTexB, texUV_B).r;
  
  // Clamp out-of-bounds sampling
  if (texUV_A.x < 0.0 || texUV_A.x > 1.0 || texUV_A.y < 0.0 || texUV_A.y > 1.0) mapA = 0.0;
  if (texUV_B.x < 0.0 || texUV_B.x > 1.0 || texUV_B.y < 0.0 || texUV_B.y > 1.0) mapB = 0.0;

  // ── Morph with scatter effect ──
  float morphEase = smoothstep(0.0, 1.0, uMorph);
  
  // Scatter intensity peaks at mid-transition
  float scatterAmount = sin(uMorph * 3.14159) * 0.25;
  float scatter = vnoise(vec3(uv * 4.0, uTime * 0.8)) * scatterAmount;
  
  // Blend map values
  float mapVal = mix(mapA, mapB, morphEase) + scatter;

  // ── Add subtle organic noise (keeps it alive) ──
  float organic = fbm(uv * 0.4, uTime * 0.15) * 0.06;
  mapVal += organic;

  // ── Subtle breathing pulse on overall density ──
  float pulse = sin(uTime * 0.2) * 0.015;
  mapVal += pulse;

  // ── Click ripple effects ──
  for (int i = 0; i < MAX_CLICKS; i++) {
    vec2 pos = uClickPos[i];
    if (pos.x >= 0.0) {
      vec2 cuv = ((pos - uResolution * 0.5) / uResolution) * vec2(aspect, 1.0);
      float timeSince = max(uTime - uClickTimes[i], 0.0);
      float dist = distance(uv, cuv);
      
      float ripple = 0.0;
      float wave1 = 0.35 * timeSince;
      ripple += exp(-pow((dist - wave1) / 0.08, 2.0)) * 0.6;
      float wave2 = 0.28 * timeSince;
      ripple += exp(-pow((dist - wave2) / 0.06, 2.0)) * 0.4;
      float wave3 = 0.2 * timeSince;
      ripple += exp(-pow((dist - wave3) / 0.04, 2.0)) * 0.25;
      
      float centerGlow = exp(-dist * 8.0) * exp(-timeSince * 2.0) * 0.5;
      ripple += centerGlow;
      
      float fade = exp(-timeSince * 0.6) * exp(-dist * 3.0);
      mapVal = max(mapVal, ripple * fade);
    }
  }

  // ── Mouse ring ──
  vec2 mouseUV = ((uMouse - uResolution * 0.5) / uResolution) * vec2(aspect, 1.0);
  float mouseDist = distance(uv, mouseUV);
  float mouseRing = exp(-pow(mouseDist - 0.02, 2.0) * 200.0) * 0.35 * uMouseActive;
  mapVal = max(mapVal, mouseRing);

  // ── Bayer dithering ──
  float bayer = Bayer8(fragCoord / pixelSize) - 0.5;
  float bw = step(0.5, mapVal + bayer);

  // ── Halftone circle mask ──
  float M = maskCircle(pixelUV, bw);

  // ── Color morphing between riso inks ──
  vec3 color = mix(uColorA, uColorB, morphEase);

  // ── Final output ──
  gl_FragColor = vec4(color, M * 0.30);
}
`;

/* ── Animation timeline ── */
const HOLD_DURATION = 5.0;     // seconds to hold each projection
const MORPH_DURATION = 2.5;    // seconds for each transition
const PHASE_DURATION = HOLD_DURATION + MORPH_DURATION;  // 7.5s per projection
const ROTATION_SPEED = 0.012;  // radians/second

/* ── Initialize the dither globe ── */
export async function initDitherGlobe(): Promise<void> {
  const container = document.getElementById('ditherBg');
  if (typeof THREE === 'undefined' || !container) {
    console.warn('THREE.js not loaded or container missing, skipping dither globe');
    return;
  }

  // Generate projection textures
  let textures: ProjectionTexture[];
  try {
    textures = await generateProjectionTextures();
  } catch (err) {
    console.warn('Failed to generate projection textures, falling back', err);
    return;
  }

  if (textures.length < 2) return;

  try {
    // ── WebGL setup ──
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';

    // ── Create Three.js textures from canvases ──
    const glTextures = textures.map(t => {
      const tex = new THREE.CanvasTexture(t.canvas);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      return tex;
    });

    // ── Click tracking ──
    const MAX_CLICKS = 10;
    const clickPositions: any[] = [];
    const clickTimesArr = new Float32Array(MAX_CLICKS);
    for (let i = 0; i < MAX_CLICKS; i++) {
      clickPositions.push(new THREE.Vector2(-1, -1));
    }

    // ── Uniforms ──
    const uniforms: Record<string, any> = {
      uResolution:  { value: new THREE.Vector2() },
      uTime:        { value: 0 },
      uPixelSize:   { value: 4 },
      uTexA:        { value: glTextures[0] },
      uTexB:        { value: glTextures[1] },
      uMorph:       { value: 0.0 },
      uColorA:      { value: new THREE.Color(...textures[0].color) },
      uColorB:      { value: new THREE.Color(...textures[1].color) },
      uRotAngle:    { value: 0.0 },
      uTexSizeA:    { value: new THREE.Vector2(textures[0].canvas.width, textures[0].canvas.height) },
      uTexSizeB:    { value: new THREE.Vector2(textures[1].canvas.width, textures[1].canvas.height) },
      uMouse:       { value: new THREE.Vector2() },
      uMouseActive: { value: 0.0 },
      uClickPos:    { value: clickPositions },
      uClickTimes:  { value: clickTimesArr },
    };

    // ── Mouse tracking ──
    const mouseTarget = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
    const mouseCurrent = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
    let lastMouseMove = 0;
    let isMouseActive = false;
    const idleThreshold = 1500;

    document.addEventListener('mousemove', (e: MouseEvent) => {
      mouseTarget.set(e.clientX, window.innerHeight - e.clientY);
      lastMouseMove = Date.now();
      isMouseActive = true;
    });

    document.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouseTarget.set(touch.clientX, window.innerHeight - touch.clientY);
        lastMouseMove = Date.now();
        isMouseActive = true;
      }
    });

    // ── Click ripples ──
    let clickIndex = 0;
    const handleClick = (x: number, y: number) => {
      const fx = x;
      const fy = window.innerHeight - y;
      uniforms.uClickPos.value[clickIndex].set(fx, fy);
      uniforms.uClickTimes.value[clickIndex] = uniforms.uTime.value;
      clickIndex = (clickIndex + 1) % MAX_CLICKS;
    };

    document.addEventListener('pointerdown', (e: PointerEvent) => handleClick(e.clientX, e.clientY));
    document.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleClick(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    // ── Scene setup ──
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    // ── Resize ──
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', resize);
    resize();

    // ── Animation state ──
    let currentProjIndex = 0;
    let nextProjIndex = 1;
    const clock = new THREE.Clock();
    let mouseActiveValue = 0.0;

    function updateProjectionPair(current: number, next: number) {
      uniforms.uTexA.value = glTextures[current];
      uniforms.uTexB.value = glTextures[next];
      uniforms.uColorA.value.setRGB(...textures[current].color);
      uniforms.uColorB.value.setRGB(...textures[next].color);
      uniforms.uTexSizeA.value.set(textures[current].canvas.width, textures[current].canvas.height);
      uniforms.uTexSizeB.value.set(textures[next].canvas.width, textures[next].canvas.height);
    }

    // ── Main loop ──
    function animate() {
      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;

      // ── Projection morphing timeline ──
      const totalCycle = PHASE_DURATION * textures.length;
      const cycleTime = elapsed % totalCycle;
      const projPhase = cycleTime / PHASE_DURATION;
      const newCurrentIndex = Math.floor(projPhase) % textures.length;
      const newNextIndex = (newCurrentIndex + 1) % textures.length;

      // Update textures if projection changed
      if (newCurrentIndex !== currentProjIndex) {
        currentProjIndex = newCurrentIndex;
        nextProjIndex = newNextIndex;
        updateProjectionPair(currentProjIndex, nextProjIndex);
      }

      // Calculate morph progress within current phase
      const phaseProgress = projPhase - Math.floor(projPhase); // 0→1 within phase
      const morphStart = HOLD_DURATION / PHASE_DURATION;
      
      if (phaseProgress < morphStart) {
        // Holding current projection
        uniforms.uMorph.value = 0.0;
      } else {
        // Morphing to next
        const morphProgress = (phaseProgress - morphStart) / (1.0 - morphStart);
        // Smooth ease-in-out
        uniforms.uMorph.value = morphProgress * morphProgress * (3.0 - 2.0 * morphProgress);
      }

      // ── Slow rotation ──
      uniforms.uRotAngle.value = elapsed * ROTATION_SPEED;

      // ── Mouse smoothing ──
      const timeSinceMouseMove = Date.now() - lastMouseMove;
      if (timeSinceMouseMove > idleThreshold) isMouseActive = false;

      const targetActiveValue = isMouseActive ? 1.0 : 0.0;
      mouseActiveValue += (targetActiveValue - mouseActiveValue) * 0.03;
      uniforms.uMouseActive.value = mouseActiveValue;

      if (isMouseActive) {
        mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.1;
        mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.1;
      }
      uniforms.uMouse.value.copy(mouseCurrent);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  } catch (err) {
    console.error('Dither globe init failed:', err);
  }
}
