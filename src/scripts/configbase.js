/* ---------------------------
   Setup Three.js básica
   --------------------------- */
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1); // plano full-screen
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1.0, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
const container = document.getElementById('content');
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.width = '100%';
renderer.domElement.style.height = '100%';
renderer.domElement.style.zIndex = '-1'; // atrás do conteúdo
container.appendChild(renderer.domElement);



/* uniforms compartilhadas */
const uniforms = {
  u_time: { value: 0.0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_mouse: { value: new THREE.Vector2(window.innerWidth/2, window.innerHeight/2) },
  u_mouseSmoothed: { value: new THREE.Vector2(window.innerWidth/2, window.innerHeight/2) },
  u_clickRipple: { value: 0.0 }, // 0..1 para animar ripple ao clicar
};

/* ---------------------------
   Fragment shader (GLSL)
   - cria gradiente azul com fbm noise
   - espalha com base na distância ao mouse
   - overlay grain
   --------------------------- */
const frag = `precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec2 u_mouseSmoothed;
uniform float u_time;
uniform float u_clickRipple;

#define PI 3.141592653589793

// hash / noise from iq (small, suitable for shaders)
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
  return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise(in vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(dot(hash2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                 dot(hash2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
             mix(dot(hash2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                 dot(hash2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x),
             u.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){
    v += a * noise(p);
    p = m * p * 1.7;
    a *= 0.5;
  }
  return v;
}

float rand(in vec2 p){
  return fract(sin(dot(p,vec2(12.9898,78.233))) * 43758.5453);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  // manter proporção do viewport (centralizar)
  vec2 aspect = vec2(u_resolution.x/u_resolution.y, 1.0);
  vec2 p = (gl_FragCoord.xy - 0.5*u_resolution.xy) / u_resolution.y; // coordenada centrada

  // mouse (normalizado em -1..1)
  vec2 mouseN = (u_mouseSmoothed - 0.5*u_resolution.xy) / u_resolution.y;

  // distância do ponto ao mouse
  float d = length(p - mouseN);

  // base gradient center que também se move com suave offset de tempo
  vec2 baseCenter = vec2(0.0, 0.1) + 0.15 * vec2(sin(u_time*0.2), cos(u_time*0.15));

  // compute "spread" effect: quando mouse perto, spread aumenta
  float mouseInfluence = smoothstep(0.7, 0.0, d); // 1 quando perto, 0 longe
  // include click ripple to create short blast
  float ripple = u_clickRipple * (1.0 - smoothstep(0.25, 0.8, d * (1.0 + u_clickRipple*2.0)));
  mouseInfluence = max(mouseInfluence, ripple);

  // noise-driven displacement (liquidy)
  float n = fbm(p*3.0 + u_time*0.08);
  float distort = (0.15 * n) * (0.6 - d); // mais distorção perto do centro

  // compute radial gradient, but displaced by noise + mouse
  vec2 center = mix(baseCenter, mouseN, 0.45) + distort * 0.25;
 float radius = (0.5 - 0.2 * mouseInfluence) * (u_resolution.y / 1080.0);

  float r = length(p - center);
  // soften edge and create multiple rings via noise
  float softness = smoothstep(radius, radius*0.6, r);
  float ring = smoothstep(radius*0.45, radius*0.4, r + 0.06*fbm(p*8.0 + u_time*0.5));

 // core color (vermelho) e glow externo (amarelo)
vec3 core  = vec3(0.0, 0.47, 1.0);        // vermelho
vec3 mid   = vec3(0.0, 0.47, 1.0);       // azul elétrico
vec3 outer = vec3(0.0, 0.0, 0.0);       // roxo
vec3 glow  = vec3(1.0, 0.933, 0.0);      // amarelo


  // blend colors according to radius and small noise
  float noiseMask = smoothstep(0.0, 1.0, fbm(p*2.5 + u_time*0.25) * 0.6 + 0.4);
  float t = clamp(1.0 - r / (radius*1.6 ) + 0.08*noiseMask, 0.0, 1.0);

  vec3 color = mix(outer, mid, smoothstep(0.0,0.6,t));
  color = mix(color, core, pow(t, 2.2));

  // subtle halo and rim
  float rim = exp(-pow((r - radius*0.9)*7.0, 2.0)) * 0.6 * (1.0 + 0.8*mouseInfluence);
  color += rim * vec3(0.45,0.85,1.0);

  // apply a gentle vignette
  float vignette = smoothstep(1.1, 0.2, length(uv - vec2(0.5)));
  color *= 0.55;

  // add final grain (procedural)
  float g = rand(gl_FragCoord.xy + floor(u_time*10.0));
  color += (g - 0.5) * 0.025; // tiny grain

  // gamma correction
  color = pow(color, vec3(0.9));

  gl_FragColor = vec4(color, 1.0);
}
`;

/* material e mesh fullscreen */
const mat = new THREE.ShaderMaterial({
  fragmentShader: frag,
  uniforms,
  depthWrite: false,
  depthTest: false,
});
const geom = new THREE.PlaneGeometry(2,2);
const mesh = new THREE.Mesh(geom, mat);
scene.add(mesh);

/* ---------------------------
   Interação do mouse (com smoothing)
   --------------------------- */
let mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };
let mouseSmoothed = { x: mouse.x, y: mouse.y };
const lerp = (a,b,t) => a + (b-a) * t;

window.addEventListener('mousemove', (e)=>{
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  uniforms.u_mouse.value.set(mouse.x, window.innerHeight - mouse.y); // not used directly by shader, but keep
});

// clique cria ripple breve
let clickTimer = 0;
window.addEventListener('pointerdown', (e)=>{
  // anima rápida explosão de ripple
  uniforms.u_clickRipple.value = 1.0;
  clickTimer = 0.0;
});

/* resize */
window.addEventListener('resizeObserver', ()=>{
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

/* ---------------------------
   Loop de animação
   --------------------------- */
const clock = new THREE.Clock();
function tick(){
  const t = clock.getElapsedTime();
  uniforms.u_time.value = t;

  // smooth mouse (lerp com easing)
  mouseSmoothed.x = lerp(mouseSmoothed.x, mouse.x, 0.12);
  mouseSmoothed.y = lerp(mouseSmoothed.y, mouse.y, 0.12);

  // enviar mouse invertido Y para shader centrado
  uniforms.u_mouseSmoothed.value.set(mouseSmoothed.x, mouseSmoothed.y);

  // animate click ripple decay
  if(uniforms.u_clickRipple.value > 0.001){
    clickTimer += 0.02;
    uniforms.u_clickRipple.value *= 0.88; // decay rápido
  } else {
    uniforms.u_clickRipple.value = 0.0;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

/* optional: keyboard shortcuts to tweak params (nice for dev) */
window.addEventListener('keydown', (e)=>{
  if(e.key === 'g'){ /* toggle grain? */ }
});

