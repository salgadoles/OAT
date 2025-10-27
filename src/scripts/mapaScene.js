import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.min.mjs";

export class MapaScene {
  constructor(container, progresso = 0) {
    this.container = container;
    this.progresso = progresso;
    this.app = null;
    this.personagem = null;
    this.etapas = [];
    this.coordenadas = [
      { x: 200, y: 500 },
      { x: 400, y: 420 },
      { x: 600, y: 370 },
      { x: 800, y: 330 },
      { x: 1000, y: 280 }
    ];
  }

  async init() {
    // Criar app PIXI
    this.app = new PIXI.Application({
      width: this.container.offsetWidth,
      height: this.container.offsetHeight,
      backgroundColor: 0x0e0e10,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });
    this.container.appendChild(this.app.view);

    await this.carregarAssets();
    this.criarCenario();
    this.criarPersonagem();

    window.addEventListener("resize", () => this.onResize());
  }

  async carregarAssets() {
    const assets = [
      { alias: "bg", src: "https://cdn.pixabay.com/photo/2017/07/08/23/47/mountains-2480283_1280.jpg" },
      { alias: "node", src: "https://upload.wikimedia.org/wikipedia/commons/0/02/Circle-icons-check.svg" },
      { alias: "char", src: "https://upload.wikimedia.org/wikipedia/commons/5/59/User-avatar.svg" }
    ];

    for (const asset of assets) {
      PIXI.Assets.add(asset.alias, asset.src);
    }

    await PIXI.Assets.load(["bg", "node", "char"]);
  }

  criarCenario() {
    const bg = new PIXI.Sprite(PIXI.Assets.get("bg"));
    bg.width = this.app.screen.width;
    bg.height = this.app.screen.height;
    this.app.stage.addChild(bg);

    this.coordenadas.forEach((pos, i) => {
      const node = new PIXI.Sprite(PIXI.Assets.get("node"));
      node.anchor.set(0.5);
      node.x = pos.x;
      node.y = pos.y;
      node.width = 50;
      node.height = 50;
      node.interactive = true;
      node.buttonMode = true;
      node.tint = (i <= this.progresso) ? 0x00ff99 : 0x333333;
      node.alpha = 0.9;
      node.on("pointerdown", () => this.irParaEtapa(i));

      this.app.stage.addChild(node);
      this.etapas.push(node);
    });
  }

  criarPersonagem() {
    this.personagem = new PIXI.Sprite(PIXI.Assets.get("char"));
    this.personagem.anchor.set(0.5);
    this.personagem.width = 60;
    this.personagem.height = 60;

    const pos = this.coordenadas[this.progresso];
    this.personagem.x = pos.x;
    this.personagem.y = pos.y - 70;

    this.app.stage.addChild(this.personagem);
  }

  irParaEtapa(i) {
    if (i > this.progresso + 1) return;
    const destino = this.coordenadas[i];

    gsap.to(this.personagem, {
      x: destino.x,
      y: destino.y - 70,
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => {
        this.progresso = i;
        localStorage.setItem("progressoAluno", i);
      }
    });
  }

  onResize() {
    this.app.renderer.resize(this.container.offsetWidth, this.container.offsetHeight);
  }
}
