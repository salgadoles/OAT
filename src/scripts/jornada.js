class JornadaVerticalScene extends Phaser.Scene {
  preload() {
    // Se tiver imagem do player, descomente:
    // this.load.image('player', '/public/imagens/player.png')
  }

  create() {
    const width = this.game.config.width
    const height = this.game.config.height

    this.cameras.main.setBackgroundColor('#87ceeb') // céu azul

    // Estrada vertical com curvas
    this.path = new Phaser.Curves.Path(width/2, 50)
    this.path.splineTo([
      { x: width/2 - 50, y: 300 },
      { x: width/2 + 30, y: 600 },
      { x: width/2 - 20, y: 900 },
      { x: width/2 + 40, y: 1200 },
      { x: width/2, y: 1500 }
    ])

    // Desenha a estrada
    const graphics = this.add.graphics()
    graphics.lineStyle(12, 0x333333, 1)
    this.path.draw(graphics)

    // Checkpoints
    this.checkpoints = [
      { t: 0, label: 'Aula 1' },
      { t: 0.25, label: 'Atividade 1' },
      { t: 0.5, label: 'Aula 2' },
      { t: 0.75, label: 'Atividade 2' },
      { t: 1, label: 'Aula 3' }
    ]

    this.checkpoints.forEach(cp => {
      const point = this.path.getPoint(cp.t)
      this.add.circle(point.x, point.y, 16, 0x00e676)
      this.add.text(point.x - 40, point.y + 20, cp.label, { fontSize: '16px', fill: '#fff', fontFamily: 'Montserrat' })
    })

    // Personagem inicial
    const start = this.path.getPoint(0)
    this.player = this.add.circle(start.x, start.y, 12, 0xff0000)

    this.tValue = 0
    this.currentCheckpoint = 0

    // Configura a câmera para seguir o personagem
    this.cameras.main.setBounds(0, 0, width, 1600) // altura total da estrada
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05)

    // Texto de instrução
    this.info = this.add.text(20, 20, 'Clique para avançar ➡️', { fontSize: '18px', fill: '#fff', scrollFactor: 0 })

    // Clique para avançar
    this.input.on('pointerdown', () => this.moverProximo())
  }

  moverProximo() {
    if (this.currentCheckpoint < this.checkpoints.length - 1) {
      this.currentCheckpoint++
      const destinoT = this.checkpoints[this.currentCheckpoint].t

      this.tweens.add({
        targets: this,
        tValue: destinoT,
        duration: 1200,
        ease: 'Power1',
        onUpdate: () => {
          const point = this.path.getPoint(this.tValue)
          this.player.x = point.x
          this.player.y = point.y
        },
        onComplete: () => {
          const cp = this.checkpoints[this.currentCheckpoint]
          this.info.setText(`Chegou em ${cp.label} ✅`)
          if (this.currentCheckpoint === this.checkpoints.length - 1) {
            this.info.setText('🎉 Jornada concluída!')
          }
        }
      })
    }
  }
}

// Configuração Phaser
const config = {
  type: Phaser.AUTO,
  width: 1900,
  height: 800,
  backgroundColor: '#212121',
  parent: 'jornada-aluno',
  scene: JornadaVerticalScene
}

window.addEventListener('load', () => {
  new Phaser.Game(config)
})
