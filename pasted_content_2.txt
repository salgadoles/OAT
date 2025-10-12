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

  gsap.to(".overlay-info", {opacity:0, x:-50, duration:0.5, ease:"power2.inOut"});
  setTimeout(()=>{
    titulo.textContent = s.titulo;
    texto.textContent  = s.texto;
    img.src = s.img;
    
    gsap.fromTo(".overlay-info",
      {opacity:0, x:-50},
      {opacity:1, x:0, duration:1.2, ease:"power3.out"}
    );

    gsap.fromTo(img,
      {opacity:0, scale:1.1, filter:"blur(4px)"},
      {opacity:1, scale:1, filter:"blur(0px)", duration:1.2, ease:"power3.out"}
    );

  
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

document.addEventListener('DOMContentLoaded', () => {
  const btnSearch = document.querySelector('.btnsearch'); 
  const sidebar = document.querySelector('#sidebarPesquisa, .sidebar-pesquisa, .sidebar-filtro');
  const fechar = document.querySelector('#fecharSidebar, .fechar-sidebar, .fechar, .close');

  if (!btnSearch) {
    console.warn('btnsearch não encontrado: verifique se existe .btnsearch no HTML');
    return;
  }
  if (!sidebar) {
    console.warn('sidebar não encontrado: verifique se existe #sidebarPesquisa ou .sidebar-pesquisa ou .sidebar-filtro');
    return;
  }

  function abrirSidebar(e) {
    if (e) e.preventDefault();
    sidebar.classList.add('ativo', 'open'); // as duas só pra garantir
    document.body.classList.add('sidebar-aberta');
  }

  function fecharSidebar() {
    sidebar.classList.remove('ativo', 'open');
    document.body.classList.remove('sidebar-aberta');
  }

  function toggleSidebar(e) {
    if (sidebar.classList.contains('ativo') || sidebar.classList.contains('open')) {
      fecharSidebar();
    } else {
      abrirSidebar(e);
    }
  }

  btnSearch.addEventListener('click', abrirSidebar);

  if (fechar) fechar.addEventListener('click', fecharSidebar);

  document.addEventListener('click', (evt) => {
    const alvo = evt.target;
    const aberto = sidebar.classList.contains('ativo') || sidebar.classList.contains('open');
    if (!aberto) return;
    if (!sidebar.contains(alvo) && !btnSearch.contains(alvo)) {
      fecharSidebar();
    }
  });

  // Esc fecha esse djanho
  document.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') fecharSidebar();
  });
});
