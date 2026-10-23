const vertexShader = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;
precision highp int;

out vec4 fragColor;

uniform vec2  uResolution;
uniform float uTime;

uniform float uIntensity;
uniform float uSpeed;
uniform int   uAnimType;
uniform vec2  uMouse;
uniform int   uColorCount;
uniform float uDistort;
uniform vec2  uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int   uRayCount;

float hash21(vec2 p){
    p = floor(p);
    float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
    return fract(f);
}

mat2 rot30(){ return mat2(0.8, -0.5, 0.5, 0.8); }

float layeredNoise(vec2 fragPx){
    vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
    vec2 q = rot30() * p;
    float n = 0.0;
    n += 0.40 * hash21(q);
    n += 0.25 * hash21(q * 2.0 + 17.0);
    n += 0.20 * hash21(q * 4.0 + 47.0);
    n += 0.10 * hash21(q * 8.0 + 113.0);
    n += 0.05 * hash21(q * 16.0 + 191.0);
    return n;
}

vec3 rayDir(vec2 frag, vec2 res, vec2 offset, float dist){
    float focal = res.y * max(dist, 1e-3);
    return normalize(vec3(2.0 * (frag - offset) - res, focal));
}

float edgeFade(vec2 frag, vec2 res, vec2 offset){
    vec2 toC = frag - 0.5 * res - offset;
    float r = length(toC) / (0.5 * min(res.x, res.y));
    float x = clamp(r, 0.0, 1.0);
    float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
    float s = q * 0.5;
    s = pow(s, 1.5);
    float tail = 1.0 - pow(1.0 - s, 2.0);
    s = mix(s, tail, 0.2);
    float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
    return clamp(s + dn, 0.0, 1.0);
}

mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0); }

vec3 sampleGradient(float t){
    t = clamp(t, 0.0, 1.0);
    return texture(uGradient, vec2(t, 0.5)).rgb;
}

vec2 rot2(vec2 v, float a){
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c) * v;
}

float bendAngle(vec3 q, float t){
    float a = 0.8 * sin(q.x * 0.55 + t * 0.6)
            + 0.7 * sin(q.y * 0.50 - t * 0.5)
            + 0.6 * sin(q.z * 0.60 + t * 0.7);
    return a;
}

void main(){
    vec2 frag = gl_FragCoord.xy;
    float t = uTime * uSpeed;
    float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
    vec3 dir = rayDir(frag, uResolution, uOffset, 1.0);
    float marchT = 0.0;
    vec3 col = vec3(0.0);
    float n = layeredNoise(frag);
    vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
    mat2 M2 = mat2(c.x, c.y, c.z, c.w);
    float amp = clamp(uDistort, 0.0, 50.0) * 0.15;

    mat3 rot3dMat = mat3(1.0);
    if(uAnimType == 1){
      vec3 ang = vec3(t * 0.31, t * 0.21, t * 0.17);
      rot3dMat = rotZ(ang.z) * rotY(ang.y) * rotX(ang.x);
    }
    mat3 hoverMat = mat3(1.0);
    if(uAnimType == 2){
      vec2 m = uMouse * 2.0 - 1.0;
      vec3 ang = vec3(m.y * 0.6, m.x * 0.6, 0.0);
      hoverMat = rotY(ang.y) * rotX(ang.x);
    }

    for (int i = 0; i < 44; ++i) {
        vec3 P = marchT * dir;
        P.z -= 2.0;
        float rad = length(P);
        vec3 Pl = P * (10.0 / max(rad, 1e-6));

        if(uAnimType == 0){
            Pl.xz *= M2;
        } else if(uAnimType == 1){
      Pl = rot3dMat * Pl;
        } else {
      Pl = hoverMat * Pl;
        }

        float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;

        float grow = smoothstep(0.35, 3.0, marchT);
        float a1 = amp * grow * bendAngle(Pl * 0.6, t);
        float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
        vec3 Pb = Pl;
        Pb.xz = rot2(Pb.xz, a1);
        Pb.xy = rot2(Pb.xy, a2);

        float rayPattern = smoothstep(
            0.5, 0.7,
            sin(Pb.x + cos(Pb.y) * cos(Pb.z)) *
            sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
        );

        if (uRayCount > 0) {
            float ang = atan(Pb.y, Pb.x);
            float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
            comb = pow(comb, 3.0);
            rayPattern *= smoothstep(0.15, 0.95, comb);
        }

        vec3 spectralDefault = 1.0 + vec3(
            cos(marchT * 3.0 + 0.0),
            cos(marchT * 3.0 + 1.0),
            cos(marchT * 3.0 + 2.0)
        );

        float saw = fract(marchT * 0.25);
        float tRay = saw * saw * (3.0 - 2.0 * saw);
        vec3 userGradient = 2.0 * sampleGradient(tRay);
        vec3 spectral = (uColorCount > 0) ? userGradient : spectralDefault;
        vec3 base = (0.05 / (0.4 + stepLen))
                  * smoothstep(5.0, 0.0, rad)
                  * spectral;

        col += base * rayPattern;
        marchT += stepLen;
    }

    col *= edgeFade(frag, uResolution, uOffset);
    col *= uIntensity;

    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const hexToRgb01 = hex => {
  let h = hex.trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) {
    const r = h[0], g = h[1], b = h[2];
    h = r + r + g + g + b + b;
  }
  const intVal = parseInt(h, 16);
  if (isNaN(intVal) || (h.length !== 6 && h.length !== 8)) return [1, 1, 1];
  const r = ((intVal >> 16) & 255) / 255;
  const g = ((intVal >> 8) & 255) / 255;
  const b = (intVal & 255) / 255;
  return [r, g, b];
};

const toPx = v => {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  const num = parseFloat(s.replace('px', ''));
  return isNaN(num) ? 0 : num;
};

class PrismaticBurst {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      intensity: 2,
      speed: 0.5,
      animationType: 'rotate3d',
      colors: [],
      distort: 1.0,
      paused: false,
      offset: { x: 0, y: 0 },
      hoverDampness: 0.25,
      rayCount: 24,
      mixBlendMode: 'lighten',
      ...options
    };

    this.mouseTarget = [0.5, 0.5];
    this.mouseSmooth = [0.5, 0.5];
    this.accumTime = 0;
    this.last = performance.now();
    this.isVisible = true;

    this.init();
  }

  async init() {
    let Renderer, Program, Mesh, Triangle, Texture;
    try {
      const ogl = await import('https://unpkg.com/ogl');
      Renderer = ogl.Renderer;
      Program = ogl.Program;
      Mesh = ogl.Mesh;
      Triangle = ogl.Triangle;
      Texture = ogl.Texture;
    } catch (e) {
      console.error("Failed to load OGL", e);
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer = new Renderer({ dpr, alpha: false, antialias: false });
    const gl = this.renderer.gl;
    this.gl = gl;

    gl.canvas.style.position = 'absolute';
    gl.canvas.style.inset = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.mixBlendMode = this.options.mixBlendMode !== 'none' ? this.options.mixBlendMode : '';
    this.container.appendChild(gl.canvas);

    const white = new Uint8Array([255, 255, 255, 255]);
    this.gradientTex = new Texture(gl, {
      image: white,
      width: 1,
      height: 1,
      generateMipmaps: false,
      flipY: false
    });
    this.gradientTex.minFilter = gl.LINEAR;
    this.gradientTex.magFilter = gl.LINEAR;
    this.gradientTex.wrapS = gl.CLAMP_TO_EDGE;
    this.gradientTex.wrapT = gl.CLAMP_TO_EDGE;

    this.program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uResolution: { value: [1, 1] },
        uTime: { value: 0 },
        uIntensity: { value: 1 },
        uSpeed: { value: 1 },
        uAnimType: { value: 0 },
        uMouse: { value: [0.5, 0.5] },
        uColorCount: { value: 0 },
        uDistort: { value: 0 },
        uOffset: { value: [0, 0] },
        uGradient: { value: this.gradientTex },
        uNoiseAmount: { value: 0.8 },
        uRayCount: { value: 0 }
      }
    });

    this.triangle = new Triangle(gl);
    this.mesh = new Mesh(gl, { geometry: this.triangle, program: this.program });

    this.resize = () => {
      const w = this.container.clientWidth || 1;
      const h = this.container.clientHeight || 1;
      this.renderer.setSize(w, h);
      this.program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };

    if ('ResizeObserver' in window) {
      this.ro = new ResizeObserver(this.resize);
      this.ro.observe(this.container);
    } else {
      window.addEventListener('resize', this.resize);
    }
    this.resize();

    this.onPointer = e => {
      const rect = this.container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const y = (e.clientY - rect.top) / Math.max(rect.height, 1);
      this.mouseTarget = [Math.min(Math.max(x, 0), 1), Math.min(Math.max(y, 0), 1)];
    };
    this.container.addEventListener('pointermove', this.onPointer, { passive: true });

    if ('IntersectionObserver' in window) {
      this.io = new IntersectionObserver(
        entries => {
          if (entries[0]) this.isVisible = entries[0].isIntersecting;
        },
        { root: null, threshold: 0.01 }
      );
      this.io.observe(this.container);
    }

    this.updateOptions();
    this.animate();
  }

  updateOptions() {
    const { intensity, speed, animationType, colors, distort, offset, rayCount } = this.options;
    const program = this.program;
    const gl = this.gl;

    program.uniforms.uIntensity.value = intensity ?? 1;
    program.uniforms.uSpeed.value = speed ?? 1;

    const animTypeMap = { rotate: 0, rotate3d: 1, hover: 2 };
    program.uniforms.uAnimType.value = animTypeMap[animationType ?? 'rotate3d'];
    program.uniforms.uDistort.value = typeof distort === 'number' ? distort : 0;
    program.uniforms.uOffset.value = [toPx(offset?.x), toPx(offset?.y)];
    program.uniforms.uRayCount.value = Math.max(0, Math.floor(rayCount ?? 0));

    let count = 0;
    if (Array.isArray(colors) && colors.length > 0) {
      const capped = colors.slice(0, 64);
      count = capped.length;
      const data = new Uint8Array(count * 4);
      for (let i = 0; i < count; i++) {
        const [r, g, b] = hexToRgb01(capped[i]);
        data[i * 4 + 0] = Math.round(r * 255);
        data[i * 4 + 1] = Math.round(g * 255);
        data[i * 4 + 2] = Math.round(b * 255);
        data[i * 4 + 3] = 255;
      }
      this.gradientTex.image = data;
      this.gradientTex.width = count;
      this.gradientTex.height = 1;
      this.gradientTex.format = gl.RGBA;
      this.gradientTex.type = gl.UNSIGNED_BYTE;
      this.gradientTex.needsUpdate = true;
    }
    program.uniforms.uColorCount.value = count;
  }

  animate() {
    const update = now => {
      const dt = Math.max(0, now - this.last) * 0.001;
      this.last = now;
      const visible = this.isVisible && !document.hidden;
      if (!this.options.paused) this.accumTime += dt;

      if (!visible) {
        this.raf = requestAnimationFrame(update);
        return;
      }

      const tau = 0.02 + Math.max(0, Math.min(1, this.options.hoverDampness)) * 0.5;
      const alpha = 1 - Math.exp(-dt / tau);
      const tgt = this.mouseTarget;
      const sm = this.mouseSmooth;
      sm[0] += (tgt[0] - sm[0]) * alpha;
      sm[1] += (tgt[1] - sm[1]) * alpha;

      this.program.uniforms.uMouse.value = sm;
      this.program.uniforms.uTime.value = this.accumTime;

      this.renderer.render({ scene: this.mesh });
      this.raf = requestAnimationFrame(update);
    };
    this.raf = requestAnimationFrame(update);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.container.removeEventListener('pointermove', this.onPointer);
    this.ro?.disconnect();
    this.io?.disconnect();
    try {
      this.container.removeChild(this.gl.canvas);
    } catch {}
    this.mesh?.remove();
    this.triangle?.remove();
    this.program?.remove();
    if (this.gradientTex?.texture) this.gl.deleteTexture(this.gradientTex.texture);
  }
}

window.PrismaticBurst = PrismaticBurst;
