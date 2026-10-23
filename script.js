// ── Default Cozy Data (Nayma Israt) ──
const DEFAULT_DATA = {
  name: "(+Nayma Israt+)",
  handle: "@nayma_israt_ilma",
  bio: "lowkey doing my own thing · anime connoisseur · unbothered mind #nonchalant 🖤",
  avatar: "https://i.imgur.com/k9yKgJR.jpeg",
  badge: "⚡",
  tags: "🧠 deep thinker, 🎧 nonchalant, 🎌 anime connoisseur, ⚡ sigma, ☕ unbothered",
  posts: "4",
  followers: "564",
  following: "153",
  instagram: "https://www.instagram.com/nayma_israt_ilma/",
  tiktok: "https://tiktok.com",
  email: "mailto:naymaisrat2416@gmail.com",
  password: "admin123",
};

// Plasma Instance
let plasmaInstance = null;

// TextType Instance
let textTypeInstance = null;
let currentRoleIndex = 0;

// ── Load data from localStorage or use defaults ──
function getData() {
  const saved = localStorage.getItem("profileData");
  let data = saved
    ? { ...DEFAULT_DATA, ...JSON.parse(saved) }
    : { ...DEFAULT_DATA };

  // Data migration: Force update if resetting to the new nonchalant & sigma theme
  if (
    data.name === "Imane Anys" ||
    data.name === "Nadia Ishrar" ||
    !data.name ||
    !data.name.includes("Nayma") ||
    !data.instagram.includes("nayma_israt_ilma") ||
    (data.avatar && data.avatar.includes("nayma_avatar_1779987371114.png"))
  ) {
    data = { ...DEFAULT_DATA };
    saveData(data);
  }
  return data;
}

function saveData(data) {
  localStorage.setItem("profileData", JSON.stringify(data));
}

// ── TextType Roles Engine ──
function initDecryptedRoles() {
  if (typeof TextType === "undefined") return;
  const target = document.getElementById("typewriter-role");
  if (!target) return;

  const roles = [
    "lowkey & unbothered",
    "quietly confident",
    "an anime connoisseur",
    "a deep thinker",
  ];

  if (!textTypeInstance) {
    // Hide the existing static blinking cursor if present to avoid double cursors
    const staticCursor = document.querySelector(".typewriter-cursor");
    if (staticCursor) {
      staticCursor.style.display = "none";
    }

    textTypeInstance = new TextType(target, {
      text: roles,
      typingSpeed: 60,
      deletingSpeed: 35,
      pauseDuration: 1800,
      initialDelay: 150, // Starts legacy styling slightly after first line
      loop: true,
      showCursor: true,
      cursorCharacter: "|",
      cursorBlinkDuration: 0.6,
      className: "gradient-text text-role",
    });
  }
}

// ── Apply data to the page dynamically ──
function applyData(data) {
  // Page & Logo title
  document.title = `${data.name} | Creator Profile`;
  const nameEl = document.getElementById("profile-display-name");
  if (nameEl) {
    nameEl.textContent = data.name;
  }

  // Set logo to first word of her name (ignoring special symbols)
  const firstWord = (data.name.match(/[a-zA-Z]+/)?.[0]) || "Nayma";
  document.getElementById("logo-name").textContent = firstWord;

  // Bio & stats
  document.getElementById("profile-bio").textContent = data.bio;
  document.getElementById("profile-avatar").src = data.avatar;
  document.getElementById("profile-badge").textContent = data.badge;

  document.getElementById("stat-posts").textContent = data.posts;
  
  // Custom scrolling & rolling nonchalant Counter for followers
  const parseFollowers = (str) => {
    const match = str.trim().match(/^([0-9.]+)([a-zA-Z]*)$/);
    if (match) {
      return {
        value: parseFloat(match[1]),
        suffix: match[2]
      };
    }
    return {
      value: parseFloat(str) || 0,
      suffix: ""
    };
  };
  const parsed = parseFollowers(data.followers);
  const statFollowersEl = document.getElementById("stat-followers");
  if (statFollowersEl) {
    if (window.followersCounter && typeof window.followersCounter.destroy === "function") {
      window.followersCounter.destroy();
    }
    window.followersCounter = new window.Counter(statFollowersEl, {
      value: parsed.value,
      suffix: parsed.suffix,
      fontSize: 24,
      fontWeight: "700",
      textColor: "var(--text-light)",
      gradientFrom: "var(--poki-dark-gray)", // matches #1b172a panel
      triggerOnScroll: true
    });
  }

  document.getElementById("stat-following").textContent = data.following;

  // CTAs
  const instagramHref = data.instagram.startsWith("http")
    ? data.instagram
    : "https://" + data.instagram;
  const emailHref = data.email.startsWith("mailto:")
    ? data.email
    : "mailto:" + data.email;

  document.getElementById("link-instagram").href = instagramHref;
  document.getElementById("link-email").href = emailHref;

  // Tags rendering
  const tagsEl = document.getElementById("profile-tags");
  if (tagsEl) {
    tagsEl.innerHTML = "";
    data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((tag) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = tag;
        tagsEl.appendChild(span);
      });
  }

  // Launch Decrypted Text Roles
  initDecryptedRoles();
}

// ── Tab Switching Logic (Sleek GPU-accelerated transition) ──
function switchTab(tabId, clickedElement) {
  const currentActive = document.querySelector(".tab-pane.active");
  const targetPane = document.getElementById(tabId);

  if (targetPane && currentActive === targetPane) {
    return; // Already active, do nothing
  }

  // 1. Hide the active pane with a fade out
  if (currentActive) {
    currentActive.classList.remove("active");
    currentActive.classList.add("exiting");
    const oldPane = currentActive;
    setTimeout(() => {
      oldPane.classList.remove("exiting");
    }, 400);
  }

  // 2. Open the designated pane
  if (targetPane) {
    targetPane.classList.remove("exiting");
    targetPane.classList.add("active");
  }

  // Update GooeyNav if needed
  if (gooeyNavInstance && gooeyNavInstance.navRef && !clickedElement) {
    const tabToIndex = {
      "tab-home": 0,
      "tab-about": 1,
      "tab-email": 3,
    };
    const index = tabToIndex[tabId];
    if (index !== undefined) {
      const liEls = gooeyNavInstance.navRef.querySelectorAll("li");
      if (liEls[index]) {
        gooeyNavInstance.handleClick(liEls[index], index, true);
      }
    }
  }
}

// Expose globally
window.switchTab = switchTab;

// ── Admin Modal Handlers ──
function openAdmin() {
  document.getElementById("admin-modal").classList.add("open");
  document.getElementById("admin-password").value = "";
  document.getElementById("pw-error").style.display = "none";
  document.getElementById("password-gate").style.display = "block";
  document.getElementById("admin-form").style.display = "none";
}

function closeAdmin() {
  document.getElementById("admin-modal").classList.remove("open");
}

function copyEmailToClipboard() {
  const emailText = "naymaisrat2416@gmail.com";
  
  const finishFeedback = (success) => {
    const btn = document.getElementById("copy-email-btn");
    if (!btn) return;
    if (success) {
      btn.innerHTML = `Copied! ✓`;
      btn.style.color = "var(--poki-aqua)";
    } else {
      btn.innerHTML = `Failed to copy ❌`;
      btn.style.color = "var(--poki-pink)";
    }
    setTimeout(() => {
      btn.innerHTML = `naymaisrat2416@gmail.com`;
      btn.style.color = "";
    }, 2000);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(emailText)
      .then(() => finishFeedback(true))
      .catch(() => fallbackCopy(emailText, finishFeedback));
  } else {
    fallbackCopy(emailText, finishFeedback);
  }
}

function fallbackCopy(text, callback) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand("copy");
    callback(successful);
  } catch (err) {
    callback(false);
  }
  document.body.removeChild(textArea);
}

function checkPassword() {
  const data = getData();
  const input = document.getElementById("admin-password").value;
  if (input === data.password) {
    document.getElementById("password-gate").style.display = "none";
    loadFormValues(data);
    document.getElementById("admin-form").style.display = "block";
  } else {
    document.getElementById("pw-error").style.display = "block";
  }
}

function loadFormValues(data) {
  document.getElementById("edit-name").value = data.name;
  document.getElementById("edit-handle").value = data.handle;
  document.getElementById("edit-bio").value = data.bio;
  document.getElementById("edit-avatar").value = data.avatar;
  document.getElementById("edit-badge").value = data.badge;
  document.getElementById("edit-tags").value = data.tags;
  document.getElementById("edit-posts").value = data.posts;
  document.getElementById("edit-followers").value = data.followers;
  document.getElementById("edit-following").value = data.following;
  document.getElementById("edit-instagram").value = data.instagram;
  document.getElementById("edit-tiktok").value = data.tiktok;
  document.getElementById("edit-email").value = data.email;
  document.getElementById("edit-password").value = "";
}

function saveChanges() {
  const data = getData();
  const newPassword = document.getElementById("edit-password").value.trim();

  const updated = {
    ...data,
    name: document.getElementById("edit-name").value.trim() || data.name,
    handle: document.getElementById("edit-handle").value.trim() || data.handle,
    bio: document.getElementById("edit-bio").value.trim() || data.bio,
    avatar: document.getElementById("edit-avatar").value.trim() || data.avatar,
    badge: document.getElementById("edit-badge").value.trim() || data.badge,
    tags: document.getElementById("edit-tags").value.trim() || data.tags,
    posts: document.getElementById("edit-posts").value.trim() || data.posts,
    followers:
      document.getElementById("edit-followers").value.trim() || data.followers,
    following:
      document.getElementById("edit-following").value.trim() || data.following,
    instagram:
      document.getElementById("edit-instagram").value.trim() || data.instagram,
    tiktok: document.getElementById("edit-tiktok").value.trim() || data.tiktok,
    email: document.getElementById("edit-email").value.trim() || data.email,
    password: newPassword || data.password,
  };

  saveData(updated);
  applyData(updated);

  const msg = document.getElementById("saved-msg");
  msg.classList.add("show");
  setTimeout(() => {
    msg.classList.remove("show");
    closeAdmin();
  }, 2000);
}

// Close modal on overlay click
document.getElementById("admin-modal").addEventListener("click", function (e) {
  if (e.target === this) closeAdmin();
});

// Enter key on password input
document
  .getElementById("admin-password")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") checkPassword();
  });

// ── Interactive Sparkle Particles Generator ──
function createParticles() {
  const container = document.getElementById("particles");
  if (!container) return;
  container.innerHTML = "";

  const colors = ["#ff75a0", "#b588f7", "#7ad1ff", "#ffd3b6", "#fff0f5"];
  const symbols = ["✦", "✧", "♡", "✿", "★", "🌸", "⭐"];

  const count = window.innerWidth < 480 ? 12 : 25;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "particle";

    const useSymbol = Math.random() > 0.4;
    if (useSymbol) {
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.fontSize = Math.random() * 12 + 10 + "px";
      el.style.color = colors[Math.floor(Math.random() * colors.length)];
    } else {
      const size = Math.random() * 6 + 4;
      el.style.width = size + "px";
      el.style.height = size + "px";
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
    }

    el.style.left = Math.random() * 100 + "vw";
    el.style.animationDuration = Math.random() * 10 + 8 + "s";
    el.style.animationDelay = Math.random() * 8 + "s";

    container.appendChild(el);
  }
}

// ── Three.js WebGL Beams Animation Engine ──
const noiseGLSL = `
float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
float cnoise(vec3 P){
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x,Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x,Pf1.y,Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy,Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy,Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x,Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
  vec2 n_yz = mix(n_z.xy,n_z.zw,fade_xyz.y);
  float n_xyz = mix(n_yz.x,n_yz.y,fade_xyz.x);
  return 2.2 * n_xyz;
}
`;

function createStackedPlanesGeometry(
  n,
  width,
  height,
  spacing,
  heightSegments,
) {
  const geometry = new THREE.BufferGeometry();
  const numVertices = n * (heightSegments + 1) * 2;
  const numFaces = n * heightSegments * 2;
  const positions = new Float32Array(numVertices * 3);
  const indices = new Uint32Array(numFaces * 3);
  const uvs = new Float32Array(numVertices * 2);

  let vertexOffset = 0;
  let indexOffset = 0;
  let uvOffset = 0;
  const totalWidth = n * width + (n - 1) * spacing;
  const xOffsetBase = -totalWidth / 2;

  for (let i = 0; i < n; i++) {
    const xOffset = xOffsetBase + i * (width + spacing);
    const uvXOffset = Math.random() * 300;
    const uvYOffset = Math.random() * 300;

    for (let j = 0; j <= heightSegments; j++) {
      const y = height * (j / heightSegments - 0.5);
      const v0 = [xOffset, y, 0];
      const v1 = [xOffset + width, y, 0];
      positions.set([...v0, ...v1], vertexOffset * 3);

      const uvY = j / heightSegments;
      uvs.set(
        [uvXOffset, uvY + uvYOffset, uvXOffset + 1, uvY + uvYOffset],
        uvOffset,
      );

      if (j < heightSegments) {
        const a = vertexOffset;
        const b = vertexOffset + 1;
        const c = vertexOffset + 2;
        const d = vertexOffset + 3;
        indices.set([a, b, c, c, b, d], indexOffset);
        indexOffset += 6;
      }
      vertexOffset += 2;
      uvOffset += 4;
    }
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}

function initBeams() {
  if (typeof THREE === "undefined") return;

  const canvas = document.getElementById("beams-canvas");
  if (!canvas) return;

  // 1. Setup Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true, // Make WebGL canvas background fully transparent so body gradient shines through
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. Setup Scene
  const scene = new THREE.Scene();

  // 3. Setup Camera (placed direct front looking at coordinates 0,0,0)
  const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  camera.position.set(0, 0, 20);

  // 4. Uniform Parameters
  const uniforms = {
    time: { value: 0 },
    uSpeed: { value: 1.8 },
    uNoiseIntensity: { value: 1.75 },
    uScale: { value: 1.5 }, // Scaled up displacement amplitude
  };

  // 5. Custom Self-Illuminated Shader Material
  // Employs a direct glowing pookie-themed (soft pink and lilac pastel gradients) blend
  const beamMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      varying float vGlow;
      uniform float time;
      uniform float uSpeed;
      uniform float uScale;
      
      ${noiseGLSL}
      
      void main() {
        vUv = uv;
        vec3 pos = position;
        
        // Ripple displacement over the y axis
        float noiseVal = cnoise(vec3(pos.x * 0.08, pos.y * 0.12 - time * uSpeed * 0.2, time * 0.05)) * uScale;
        pos.z += noiseVal * 4.5;
        
        vGlow = noiseVal;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying float vGlow;
      uniform float time;
      uniform float uNoiseIntensity;
      
      float rand(vec2 co) {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }
      
      void main() {
        // High-end cozy Pookie Theme Colors (soft pink, glowing lavender lilac, and warm peach)
        vec3 pookiePink = vec3(1.0, 0.46, 0.63);   // #ff75a0
        vec3 pookieLilac = vec3(0.71, 0.53, 0.97);  // #b588f7
        vec3 pookiePeach = vec3(1.0, 0.83, 0.71);  // #ffd3b6
        
        // Smooth dynamic wave gradient shifting with time
        vec3 baseColor = mix(pookiePink, pookieLilac, vUv.y + sin(time * 0.12) * 0.2);
        baseColor = mix(baseColor, pookiePeach, sin(vUv.x * 3.14 + time * 0.3) * 0.5 + 0.5);
        
        // Volumetric height intensity glow
        float intensity = smoothstep(-1.2, 1.2, vGlow) * 0.75 + 0.25;
        
        // Soft ribbon horizontal edges
        float edgeGlow = sin(vUv.x * 3.14159);
        vec3 finalColor = baseColor * intensity * edgeGlow * 1.8;
        
        // Film grain texture noise overlay
        float grain = rand(gl_FragCoord.xy) * 0.07 * uNoiseIntensity;
        finalColor -= vec3(grain);
        
        // Translucent Alpha mapping to blend with standard CSS background
        float alpha = edgeGlow * 0.68 * (intensity * 0.68 + 0.32);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    uniforms: uniforms,
    transparent: true,
    side: THREE.DoubleSide,
  });

  // 6. Geometry & Mesh Stack
  // beamWidth = 2, beamHeight = 15, beamNumber = 12, spacing = 0.1
  const beamGeometry = createStackedPlanesGeometry(12, 2.0, 15.0, 0.1, 100);
  const mesh = new THREE.Mesh(beamGeometry, beamMaterial);

  // Group and rotate to display tilted glowing beams in background
  const group = new THREE.Group();
  group.rotation.z = -12 * (Math.PI / 180);
  group.add(mesh);
  scene.add(group);

  // 7. Tick Frame Loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    uniforms.time.value += delta;
    renderer.render(scene, camera);
  }
  animate();

  // 8. Handle Resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ── Plasma Initialization ──
function initPlasma() {
  const container = document.getElementById("plasma-bg");
  if (!container) return;

  plasmaInstance = new Plasma(container, {
    color: "#FFB6C1", // Coquette Bow Pink from Pookie Palette
    speed: 0.6,
    direction: "forward",
    scale: 1.1,
    opacity: 0.8,
    mouseInteractive: true,
  });
}

// ── PixelBlast Interactive Background ──
let pixelBlastInstance = null;

function initPixelBlast() {
  const container = document.getElementById("pixel-blast-bg");
  if (!container) return;

  const pp = window.postprocessing || window.POSTPROCESSING;
  if (typeof window.PixelBlast === "undefined" || typeof window.THREE === "undefined" || !pp) {
    // If dependencies are not loaded yet, wait and try again
    setTimeout(initPixelBlast, 100);
    return;
  }

  pixelBlastInstance = new window.PixelBlast(container, {
    variant: "circle",
    pixelSize: 12, // Bold pixel blocks for prominent aesthetics
    color: "#766fac",
    patternScale: 3,
    patternDensity: 1.6, // Higher density to form richer shapes
    pixelSizeJitter: 0.6,
    enableRipples: true,
    rippleSpeed: 0.5,
    rippleThickness: 0.14,
    rippleIntensityScale: 1.8,
    liquid: true,
    liquidStrength: 0.15,
    liquidRadius: 1.5,
    liquidWobbleSpeed: 5.5,
    speed: 0.8,
    edgeFade: 0.2,
    transparent: true,
  });
}

// ── GooeyNav Initialization ──
let gooeyNavInstance = null;

function initGooeyNav() {
  const mount = document.getElementById("gooey-nav-mount");
  if (!mount) return;

  const navItems = [
    { label: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Home', href: "#", tabId: "tab-home" },
    { label: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> About', href: "#", tabId: "tab-about" },
    { label: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> Insta', href: "#", action: "insta" },
    { label: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Contact', href: "#", tabId: "tab-email" },
    { label: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Admin', href: "#", action: "admin" },
  ];

  gooeyNavInstance = new GooeyNav(mount, {
    items: navItems,
    particleCount: 15,
    particleDistances: [90, 10],
    particleR: 100,
    initialActiveIndex: 0,
    animationTime: 600,
    timeVariance: 300,
    colors: [1, 2, 3, 1, 2, 3, 1, 4],
    onItemClick: (item, index) => {
      if (item.action === "admin") {
        openAdmin();
        return;
      }
      if (item.action === "insta") {
        const data = getData();
        const instagramHref = data.instagram.startsWith("http")
          ? data.instagram
          : "https://" + data.instagram;
        window.open(instagramHref, "_blank");
        return;
      }
      // Sync with the existing tab system
      switchTab(item.tabId, null);
    },
  });
}

// ── Folder Component Initialization ──
let folderInstance = null;

function initFolder() {
  const mount = document.getElementById("qualities-folder-mount");
  if (!mount) return;

  folderInstance = new FolderComponent(mount, {
    color: "#766fac", // Nonchalant orchid
    size: 1.8,
    className: "qualities-folder",
    items: [
      '<span class="paper-emoji">⚡</span><span>Sigma &<br>Focused</span>',
      '<span class="paper-emoji">🎧</span><span>Chill &<br>Lowkey</span>',
      '<span class="paper-emoji">🌌</span><span>Dreamer</span>',
    ],
  });
}

// ════════════════════════════════════════
//           🥚 EASTER EGGS 🥚
// ════════════════════════════════════════

// ── Easter Egg 1: Konami Code (↑↑↓↓←→←→BA) ──
const konamiSequence = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
let konamiProgress = 0;

function initKonamiCode() {
  document.addEventListener("keydown", (e) => {
    const expected = konamiSequence[konamiProgress];
    if (e.key === expected || e.key.toLowerCase() === expected) {
      konamiProgress++;
      if (konamiProgress === konamiSequence.length) {
        konamiProgress = 0;
        triggerKonamiEasterEgg();
      }
    } else {
      konamiProgress = 0;
    }
  });
}

function triggerKonamiEasterEgg() {
  const overlay = document.getElementById("easter-egg-overlay");
  if (!overlay) return;
  overlay.classList.add("active");

  // Start emoji rain
  const rainContainer = document.getElementById("easter-emoji-rain");
  if (rainContainer) {
    rainContainer.innerHTML = "";
    const emojis = ["🌸", "💖", "✨", "🎵", "🧠", "💫", "♡", "🎌", "⭐", "🌷"];
    for (let i = 0; i < 50; i++) {
      const drop = document.createElement("span");
      drop.className = "rain-drop";
      drop.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      drop.style.left = Math.random() * 100 + "vw";
      drop.style.animationDuration = Math.random() * 3 + 2 + "s";
      drop.style.animationDelay = Math.random() * 2 + "s";
      drop.style.fontSize = Math.random() * 20 + 16 + "px";
      rainContainer.appendChild(drop);
    }
  }
}

function closeEasterEgg() {
  const overlay = document.getElementById("easter-egg-overlay");
  if (overlay) overlay.classList.remove("active");
  showSecretToast(
    "🥚 You're an easter egg hunter! Try clicking the avatar 5 times...",
  );
}
window.closeEasterEgg = closeEasterEgg;

// ── Easter Egg 2: Avatar Multi-Click Heart Explosion ──
let avatarClickCount = 0;
let avatarClickTimer = null;

function initAvatarEasterEgg() {
  const avatarWrapper = document.querySelector(".halo-avatar-wrapper");
  if (!avatarWrapper) return;

  avatarWrapper.addEventListener("click", (e) => {
    avatarClickCount++;
    clearTimeout(avatarClickTimer);

    // Small sparkle token on every click
    spawnHeart(e.clientX, e.clientY);

    avatarClickTimer = setTimeout(() => {
      if (avatarClickCount >= 5) {
        // Trigger massive sparkle explosion!
        triggerHeartExplosion(e.clientX, e.clientY);
        avatarWrapper.classList.add("avatar-wiggle");
        setTimeout(() => avatarWrapper.classList.remove("avatar-wiggle"), 1000);
        showSecretToast("⚡ Unbothered & focused. Stay on your grind! ✦");
      }
      avatarClickCount = 0;
    }, 600);
  });
}

function spawnHeart(x, y) {
  const container = document.getElementById("heart-explosion");
  if (!container) return;

  const hearts = ["⚡", "✦", "🖤", "🌌", "🍵", "🎧", "✧"];
  const heart = document.createElement("span");
  heart.className = "heart-float";
  heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
  heart.style.left = x + (Math.random() - 0.5) * 40 + "px";
  heart.style.top = y + "px";
  heart.style.fontSize = Math.random() * 16 + 18 + "px";
  container.appendChild(heart);

  setTimeout(() => heart.remove(), 2000);
}

function triggerHeartExplosion(cx, cy) {
  const container = document.getElementById("heart-explosion");
  if (!container) return;

  for (let i = 0; i < 25; i++) {
    setTimeout(() => {
      spawnHeart(
        cx + (Math.random() - 0.5) * 200,
        cy + (Math.random() - 0.5) * 100,
      );
    }, i * 50);
  }
}

// ── Easter Egg 3: Logo Double-Click → Matrix Emoji Rain ──
function initLogoEasterEgg() {
  const logo = document.getElementById("header-logo");
  if (!logo) return;

  logo.addEventListener("dblclick", (e) => {
    e.preventDefault();
    triggerMatrixRain();
    showSecretToast(
      "✦ Decrypting mainframe... matrix simulation initialized ⚡",
    );
  });
}

function triggerMatrixRain() {
  const chars = [
    "✦",
    "✧",
    "⚡",
    "★",
    "🌌",
    "🎧",
    "🖤",
    "☕",
    "N",
    "A",
    "D",
    "I",
    "A",
  ];
  const colors = ["#d5cee3", "#766fac", "#98b9c4", "#d3bea2"];

  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const el = document.createElement("span");
      el.className = "matrix-rain-char";
      el.textContent = chars[Math.floor(Math.random() * chars.length)];
      el.style.left = Math.random() * 100 + "vw";
      el.style.top = "-20px";
      el.style.color = colors[Math.floor(Math.random() * colors.length)];
      el.style.textShadow = `0 0 8px ${el.style.color}`;
      el.style.animationDuration = Math.random() * 2 + 1.5 + "s";
      el.style.animationDelay = "0s";
      document.body.appendChild(el);

      setTimeout(() => el.remove(), 4000);
    }, i * 80);
  }
}

// ── Easter Egg 4: Secret Keyboard Shortcut (Ctrl+Shift+L = Lowkey Mode) ──
function initSecretShortcut() {
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      showSecretToast(
        "⚡ Lowkey mode enabled. Commencing system-wide synchronization... 🌌"
      );

      // Flash the whole page border
      const cards = document.querySelectorAll(
        ".about-card, .stats-card, .contact-card",
      );
      cards.forEach((card) => {
        card.classList.add("rainbow-flash");
        setTimeout(() => card.classList.remove("rainbow-flash"), 3000);
      });
    }
  });
}

// ── Easter Egg 5: Typing "nayma" anywhere triggers a toast ──
let typedChars = "";

function initNameEasterEgg() {
  document.addEventListener("keypress", (e) => {
    // Don't trigger inside input fields
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    typedChars += e.key.toLowerCase();

    // Keep only last 10 chars
    if (typedChars.length > 10) {
      typedChars = typedChars.slice(-10);
    }

    if (typedChars.includes("nayma")) {
      typedChars = "";
      showSecretToast("⚡ Real recognize real. Staying unbothered! ✦");

      // Trigger a quick sparkle burst around the name
      const nameEl = document.getElementById("profile-display-name");
      if (nameEl) {
        nameEl.style.animation = "none";
        void nameEl.offsetWidth;
        nameEl.style.animation = "easterShimmer 1s ease-in-out";
        setTimeout(() => {
          nameEl.style.animation = "";
        }, 1000);
      }
    }

    if (typedChars.includes("love")) {
      typedChars = "";
      showSecretToast(
        "✦ Respect the hustle. Stay focused on your own path! ⚡",
      );
      triggerHeartExplosion(window.innerWidth / 2, window.innerHeight / 2);
    }

    if (typedChars.includes("sing")) {
      typedChars = "";
      showSecretToast("🎧 Nayma's current frequency: aesthetic lo-fi and deep midnight phonk 🎵");
    }
  });
}

// ── Easter Egg 6: Stats Counter Speed Click → Party Mode ──
let statsClickCount = 0;
let statsClickTimer = null;

function initStatsEasterEgg() {
  const statsCard = document.querySelector(".stats-card");
  if (!statsCard) return;

  statsCard.addEventListener("click", () => {
    statsClickCount++;
    clearTimeout(statsClickTimer);

    statsClickTimer = setTimeout(() => {
      if (statsClickCount >= 7) {
        showSecretToast(
          "🚀 SIGMA ENGINE ACTIVE! You've tapping into key metrics 7 times! ⚡",
        );
        statsCard.classList.add("rainbow-flash");
        setTimeout(() => statsCard.classList.remove("rainbow-flash"), 3000);

        // Temporarily inflate the numbers with a fun animation
        const numEls = statsCard.querySelectorAll(".stat-num");
        numEls.forEach((el) => {
          const original = el.textContent;
          el.textContent = "∞";
          el.style.color = "var(--poki-pink)";
          setTimeout(() => {
            el.textContent = original;
            el.style.color = "";
          }, 2500);
        });
      }
      statsClickCount = 0;
    }, 800);
  });
}

// ── Secret Toast Notification System ──
let toastTimer = null;

function showSecretToast(text) {
  const toast = document.getElementById("secret-toast");
  const toastText = document.getElementById("secret-toast-text");
  if (!toast || !toastText) return;

  clearTimeout(toastTimer);
  toastText.textContent = text;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

// ── Init on load ──
document.addEventListener("DOMContentLoaded", () => {
  const activeData = getData();
  applyData(activeData);
  
  // Only initialize the interactive PixelBlast background, keeping resources light and responsive
  initPixelBlast();

  // Initialize New Components
  initGooeyNav();
  initFolder();

  // Initialize Easter Eggs 🥚
  initKonamiCode();
  initAvatarEasterEgg();
  initLogoEasterEgg();
  initSecretShortcut();
  initNameEasterEgg();
  initStatsEasterEgg();

  window.addEventListener("resize", () => {
    // No longer regenerating particles to save CPU/GPU cycles
  });
});
