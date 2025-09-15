// ===== Canvas Setup =====
const canvas = document.getElementById("cloud");
const ctx = canvas.getContext("2d");
function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize',resize);

// ===== Simplex Noise =====
class Simplex {
  constructor() {
    this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
                  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
                  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    this.p = [];
    for (let i=0; i<256; i++) this.p[i] = Math.floor(Math.random()*256);
    this.perm = [];
    for (let i=0; i<512; i++) this.perm[i]=this.p[i & 255];
    this.simplex = [
      [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,3,1,2],[0,3,2,1],
      [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[1,3,0,2],[1,0,2,3],[1,0,3,2],
      [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,0,1,3],[2,1,3,0],[2,1,0,3],
      [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[3,1,2,0],[3,1,0,2]
    ];
  }
  dot(g,x,y){return g[0]*x+g[1]*y;}
  noise(xin,yin){
    const grad3=this.grad3,perm=this.perm,simplex=this.simplex;
    let n0,n1,n2;
    const F2=0.5*(Math.sqrt(3.0)-1.0);
    const s=(xin+yin)*F2;
    const i=Math.floor(xin+s);
    const j=Math.floor(yin+s);
    const G2=(3.0-Math.sqrt(3.0))/6.0;
    const t=(i+j)*G2;
    const X0=i-t;
    const Y0=j-t;
    const x0=xin-X0;
    const y0=yin-Y0;
    let i1,j1;
    if(x0>y0){i1=1;j1=0;}else{i1=0;j1=1;}
    const x1=x0 - i1 + G2;
    const y1=y0 - j1 + G2;
    const x2=x0 - 1.0 + 2.0 * G2;
    const y2=y0 - 1.0 + 2.0 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = perm[ii+perm[jj]] % 12;
    const gi1 = perm[ii+i1+perm[jj+j1]] % 12;
    const gi2 = perm[ii+1+perm[jj+1]] % 12;
    let t0 = 0.5 - x0*x0 - y0*y0;
    if(t0<0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(grad3[gi0], x0, y0);
    }
    let t1 = 0.5 - x1*x1 - y1*y1;
    if(t1<0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(grad3[gi1], x1, y1);
    }
    let t2 = 0.5 - x2*x2 - y2*y2;
    if(t2<0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(grad3[gi2], x2, y2);
    }
    return 70.0 * (n0 + n1 + n2);
  }
}
const noise = new Simplex();

// ===== Animador =====
let t = 0;
function animate(){
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.createImageData(w,h);
  const data = imageData.data;
  const scale = 0.0025; // tamanho das “nuvens”
  const speed = 0.0005; // velocidade de movimento
  for(let y=0; y<h; y++){
    for(let x=0; x<w; x++){
      const n = noise.noise(x*scale + t, y*scale + t*0.5);
      // normaliza para 0..1
      const v = (n + 1) * 0.5;
      // Gradiente de cores (roxo-azulado)
      const r = 40 + v*180;
      const g = 40 + v*90;
      const b = 100 + v*155;
      const index = (x + y * w) * 4;
      data[index] = r;
      data[index+1] = g;
      data[index+2] = b;
      data[index+3] = 255;
    }
  }
  ctx.putImageData(imageData,0,0);
  t += speed;
  requestAnimationFrame(animate);
}
animate();