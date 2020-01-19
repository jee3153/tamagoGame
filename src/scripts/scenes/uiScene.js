export default class UiScene extends Phaser.Scene {


  constructor() {
    super({ key: 'UiScene' })
  }

  preload() {

  }

  create() {
    // stats bar
    const hungerBar = this.add.graphics()
    const funBar = this.add.graphics()
    const hygineBar = this.add.graphics()

    const bar = {
      width: 150,
      height: 30
    }

    const bars = [hungerBar, funBar, hygineBar]

    hungerBar.setPosition(0, 0)
    funBar.setPosition(0, 30)
    hygineBar.setPosition(0, 50)

    bars.forEach(bar => {
      bar.fillStyle('0xF5F5F5', 1)
      bar.fillRect(0, 0, bar.width, bar.height)
    })

    console.log(hungerBar)
  }

  update() {

  }
}
