const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const plasmaVertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const plasmaFragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
  
  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y)); 
    p.z -= 4.; 
    S = p;
    d = p.y-T;
    
    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05); 
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T)); 
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4; 
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }
  
  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);
  
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
  
  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

class Plasma {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      color: '#ffffff',
      speed: 1,
      direction: 'forward',
      scale: 1,
      opacity: 1,
      mouseInteractive: true,
      ...options
    };

    this.mousePos = { x: 0, y: 0 };
    this.init();
  }

  async init() {
    let Renderer, Program, Mesh, Triangle;
    try {
      const ogl = await import('https://unpkg.com/ogl');
      Renderer = ogl.Renderer;
      Program = ogl.Program;
      Mesh = ogl.Mesh;
      Triangle = ogl.Triangle;
    } catch (e) {
      console.error("Failed to load OGL", e);
      return;
    }

    const useCustomColor = this.options.color ? 1.0 : 0.0;
    const customColorRgb = this.options.color ? hexToRgb(this.options.color) : [1, 1, 1];
    const directionMultiplier = this.options.direction === 'reverse' ? -1.0 : 1.0;

    try {
      this.renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2)
      });
    } catch (e) {
      console.error("OGL Renderer creation failed", e);
      return;
    }

    const gl = this.renderer.gl;
    this.gl = gl;
    this.canvas = gl.canvas;
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.container.appendChild(this.canvas);

    const geometry = new Triangle(gl);

    this.program = new Program(gl, {
      vertex: plasmaVertex,
      fragment: plasmaFragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: useCustomColor },
        uSpeed: { value: this.options.speed * 0.4 },
        uDirection: { value: directionMultiplier },
        uScale: { value: this.options.scale },
        uOpacity: { value: this.options.opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: this.options.mouseInteractive ? 1.0 : 0.0 }
      }
    });

    this.mesh = new Mesh(gl, { geometry, program: this.program });

    this.handleMouseMove = e => {
      if (!this.options.mouseInteractive) return;
      const rect = this.container.getBoundingClientRect();
      this.mousePos.x = e.clientX - rect.left;
      this.mousePos.y = e.clientY - rect.top;
      const mouseUniform = this.program.uniforms.uMouse.value;
      mouseUniform[0] = this.mousePos.x;
      mouseUniform[1] = this.mousePos.y;
    };

    if (this.options.mouseInteractive) {
      this.container.addEventListener('mousemove', this.handleMouseMove);
    }

    this.setSize = () => {
      const rect = this.container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      this.renderer.setSize(width, height);
      const res = this.program.uniforms.iResolution.value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };

    this.ro = new ResizeObserver(this.setSize);
    this.ro.observe(this.container);
    this.setSize();

    this.contextLost = false;
    this.isVisible = true;
    this.t0 = performance.now();

    this.loop = t => {
      if (this.contextLost || !this.isVisible) return;
      let timeValue = (t - this.t0) * 0.001;
      
      if (this.options.direction === 'pingpong') {
        const pingpongDuration = 10;
        const segmentTime = timeValue % pingpongDuration;
        const isForward = Math.floor(timeValue / pingpongDuration) % 2 === 0;
        const u = segmentTime / pingpongDuration;
        const smooth = u * u * (3 - 2 * u);
        const pingpongTime = isForward ? smooth * pingpongDuration : (1 - smooth) * pingpongDuration;
        this.program.uniforms.uDirection.value = 1.0;
        this.program.uniforms.iTime.value = pingpongTime;
      } else {
        this.program.uniforms.iTime.value = timeValue;
      }
      
      this.renderer.render({ scene: this.mesh });
      this.raf = requestAnimationFrame(this.loop);
    };

    this.handleContextLost = (e) => {
      e.preventDefault();
      this.contextLost = true;
      cancelAnimationFrame(this.raf);
    };
    this.handleContextRestored = () => {
      this.contextLost = false;
      if (this.isVisible) {
        cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(this.loop);
      }
    };
    this.canvas.addEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored);

    this.io = new IntersectionObserver(([entry]) => {
      const wasVisible = this.isVisible;
      this.isVisible = entry.isIntersecting;
      if (this.isVisible && !wasVisible && !this.contextLost) {
        cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(this.loop);
      }
    }, { threshold: 0 });
    this.io.observe(this.container);

    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);
    if (this.options.mouseInteractive && this.container) {
      this.container.removeEventListener('mousemove', this.handleMouseMove);
    }
    try {
      this.container.removeChild(this.canvas);
    } catch {}
  }
}

window.Plasma = Plasma;
