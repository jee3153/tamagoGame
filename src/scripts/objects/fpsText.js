export default class FpsText extends Phaser.GameObjects.Text {
  constructor(scene) {
    super(scene, 10, 10, '', { color: 'black', fontSize: '60px' })
    scene.add.existing(this)
    this.setOrigin(0)
  }

  update() {
    this.setText(`fps: ${Math.floor(this.scene.game.loop.actualFps)}`)
  }
}