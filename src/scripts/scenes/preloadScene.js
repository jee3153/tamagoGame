export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    // load atlas
    this.load.atlas('pets', 'assets/img/sprites.png', 'assets/img/sprites.json')

    // load background
    this.load.image('bg', 'assets/img/bg.png')
  }

  create() {
    const gameW = this.game.canvas.width
    const gameH = this.game.canvas.height

    let bg = this.add.sprite(0, 0, 'bg').setOrigin(0, 0).setInteractive()

    let pet = this.add.sprite(gameW / 2, 0, 'pets', 'assets/img/tamago00.png').setScale(2)
    pet.setFrame('tamago00.png')

    let textTitle = this.add.text(gameW / 2, -50, 'TAMAGO GAME', {
      font: '40px sans-serif',
      fill: '#000'
    })

    let textStart = this.add.text(gameW / 2, -50, 'CLICK TO START', {
      font: '30px sans-serif',
      fill: '#000'
    })

    textTitle.setOrigin(0.5, 0)
    textStart.setOrigin(0.5, 0)


    let petMoving = () => {

      pet.play('tamago-moving')
      textStart.alpha = 1
      bg.on('pointerdown', () => {
        this.scene.start('MainScene')
      }, this)

    }

    this.animconfig = (prefix, start, end) => {
      const animconfig = {
        prefix,
        suffix: '.png',
        start: start,
        end,
        zeroPad: 2
      }
      return animconfig
    }

    // death animation
    this.anims.create({
      key: 'dying',
      frameRate: 5,
      repeat: -1,
      frames: this.anims.generateFrameNames('pets', this.animconfig('death', 0, 1))
    })

    // load animations 
    this.animations('tamago')
    this.animations('hanpen')
    this.animations('meatboya')
    this.animations('chikuwa')
    this.animations('chikuwakun')


    this.timeline = this.tweens.createTimeline()

    this.timelineAdd(pet, gameH / 2)
    this.timelineAdd(textTitle, gameH / 2 - 200, petMoving)
    this.timelineAdd(textStart, gameH / 2 + 200)

    this.timeline.play()

    // this.scene.start('MainScene', { stage: this.stage })

  }

  tweens(key, x, y, fn, duration = 500, ) {
    let tween = this.tweens.add({
      targets: key,
      duration,
      x,
      y,
      paused: false,
      callbackScope: this,
      onComplete: fn
    })
    return tween
  }

  timelineAdd(targets, y, onComplete, duration = 500) {
    let timeline = this.timeline.add({
      targets,
      y,
      ease: 'linear',
      duration,
      onComplete
    })

    return timeline
  }

  animations(stage) {
    const keys = [`${stage}-moving`, `${stage}-sick`, `${stage}-sleeping`, `${stage}-taking a shower`, `${stage}-playing`, `${stage}-eating`, `${stage}-being healthy`]

    for (const key of keys) {
      let config
      let repeat

      switch (key) {

        case `${stage}-moving`:
          config = this.animconfig(stage, 0, 2)
          repeat = -1
          break

        case `${stage}-sick`:
          config = this.animconfig(stage, 5, 6)
          repeat = -1
          break
        case `${stage}-sleeping`:
          config = this.animconfig(stage, 11, 12)
          repeat = -1
          break

        case `${stage}-taking a shower`:
          config = this.animconfig(stage, 9, 10)
          repeat = 3
          break

        case `${stage}-playing`:
          config = this.animconfig(stage, 7, 8)
          repeat = 3
          break

        case `${stage}-eating`:
          config = this.animconfig(stage, 3, 4)
          repeat = 3
          break

        case `${stage}-being healthy`:
          config = this.animconfig(stage, 13, 14)
          repeat = 3
          break
      }

      const animation = this.anims.create({
        key,
        frameRate: 5,
        repeat,
        frames: this.anims.generateFrameNames('pets', config)
      })
    }
  }
}
