const slides = [
  {titulo:"Curso de Python Avançado", texto:"Automação, APIs e IA", img:"https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna", link:"#"},
  {titulo:"Design UI/UX", texto:"Crie interfaces modernas", img:"https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna", link:"#"},
  {titulo:"Machine Learning", texto:"Modelos inteligentes e predição", img:"https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna", link:"#"},
  {titulo:"Marketing Digital", texto:"Estratégias e crescimento online", img:"https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna", link:"#"}
];

let index = 0;
const tempoSlide = 5;
const titulo = document.getElementById("curso-titulo");
const texto  = document.getElementById("curso-texto");
const img    = document.getElementById("curso-img");
const container = document.getElementById("progress-container");

function criaBarras(){
  slides.forEach(()=> {
    const item = document.createElement("div");
    item.classList.add("progress-item");
    const inner = document.createElement("div");
    inner.classList.add("progress-inner");
    item.appendChild(inner);
    container.appendChild(item);
  });
}
criaBarras();
const barras = document.querySelectorAll(".progress-inner");

function trocaSlide(){
  const s = slides[index];

  // anima overlay info
  gsap.to(".overlay-info", {opacity:0, x:-50, duration:0.5, ease:"power2.inOut"});
  setTimeout(()=>{
    titulo.textContent = s.titulo;
    texto.textContent  = s.texto;
    img.src = s.img;
    
    gsap.fromTo(".overlay-info",
      {opacity:0, x:-50},
      {opacity:1, x:0, duration:1.2, ease:"power3.out"}
    );

    // imagem com efeito de zoom e blur
    gsap.fromTo(img,
      {opacity:0, scale:1.1, filter:"blur(4px)"},
      {opacity:1, scale:1, filter:"blur(0px)", duration:1.2, ease:"power3.out"}
    );

    // reset e animação da barra atual
    barras.forEach((b,i)=>{
      gsap.killTweensOf(b);
      gsap.set(b,{width: i<index ? "100%" : "0%"});
    });

    gsap.fromTo(barras[index],
      {width:"0%"},
      {width:"100%", duration:tempoSlide, ease:"power1.inOut", onComplete:()=> {
        gsap.to(barras[index], {scaleY:1.3, yoyo:true, repeat:1, duration:0.3, ease:"power1.inOut"});
      }}
    );

    index = (index + 1) % slides.length;
  },500);
}

trocaSlide();
setInterval(trocaSlide, tempoSlide*1000);

const painel = document.getElementById('painelFiltro');
const btnAbrir = document.getElementById('btnFiltro');
const btnFechar = document.getElementById('fecharFiltro');

btnAbrir.addEventListener('click', () => {
  painel.classList.add('ativo');
});

btnFechar.addEventListener('click', () => {
  painel.classList.remove('ativo');
});

// opcional: fechar clicando fora
document.addEventListener('click', (e)=>{
  if(painel.classList.contains('ativo') &&
     !painel.contains(e.target) &&
     e.target !== btnAbrir){
       painel.classList.remove('ativo');
  }
});
