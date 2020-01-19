
export default class MainScene extends Phaser.Scene {

  constructor() {
    super({ key: 'MainScene' })
  }

  init() {
    // grown stage 
    this.stage = 'tamago'

    // stats
    this.stats = {
      hunger: 70,
      fun: 70,
      hygine: 70,
      affection: 0,
      health: 50
    }

    // stat rate
    this.statRate = {
      feed: { hunger: 20 },
      snack: { hunger: 10, fun: 10 },
      play: { fun: 20 },
      hostpital: { health: 50 }
    }

    // max stat
    this.maxStat = 100
    this.affectionMaxStat = this.stage === 'tamago' ? 50 : 100

    // decay parameters
    this.decayRates = {
      hunger: -5,
      fun: -5,
      hygine: -5,
      affection: -2,
      health: -2
    }
  }

  preload() {
    // load images
    this.load.image('affection', 'assets/img/affection.png')
    this.load.image('shower', 'assets/img/shower.png')
    this.load.image('feed', 'assets/img/feed.png')
    this.load.image('snack', 'assets/img/snack.png')
    this.load.image('hospital', 'assets/img/hospital.png')
    this.load.image('sleep', 'assets/img/sleep.png')
    this.load.image('play', 'assets/img/play.png')

  }

  create() {
    const canvasWidth = this.game.canvas.width
    const canvasHeight = this.game.canvas.height
    console.log(canvasWidth)

    this.tamago = this.add.sprite(canvasWidth / 2, canvasHeight / 2, 'tamago', 'assets/img/tamago.png')
    this.tamago.setScale(2)

    this.statbarMaker()
    this.refreshHUD()

    this.interface(canvasWidth, canvasHeight - 50)

    this.tamago.play('moving')

    // is tamago sick?
    this.isSick = false

    this.backToDefault()

    // decay of stats over time
    this.timedEventStats = this.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        // update stats
        this.updateStat(this.decayRates)
      },
      callbackScope: this
    })

  }

  interface(screenW, screenH) {
    const margin = 200

    // add icons on interface
    this.shower = this.add.sprite((screenW - margin) / 6, screenH, 'shower')
      .setScale(1.5).setInteractive()
    this.shower.customStats = { hygine: 100 }

    this.feed = this.add.sprite((screenW - margin) / 6 * 2, screenH, 'feed')
      .setScale(1.5).setInteractive()
    this.feed.customStats = { hunger: 20 }

    this.snack = this.add.sprite((screenW - margin) / 6 * 3, screenH, 'snack')
      .setScale(1.5).setInteractive()
    this.snack.customStats = { hunger: 10, fun: 10, health: -10 }

    this.play = this.add.sprite((screenW - margin) / 6 * 4, screenH, 'play')
      .setScale(1.5).setInteractive()
    this.play.customStats = { fun: 20 }

    this.sleep = this.add.sprite((screenW - margin) / 6 * 5, screenH, 'sleep')
      .setScale(1.5).setInteractive()
    this.sleep.customStats = { fun: 20 }

    this.hospital = this.add.sprite((screenW - margin), screenH, 'hospital')
      .setScale(1.5).setInteractive()
    this.hospital.customStats = { affection: -30, health: 60 }

    // ui unblock
    this.uiBlocked = false

    // if tamago is sick 
    this.isSick = false

    if (!this.uiBlocked) {
      this.shower.on('pointerdown', this.pickItem)
      this.feed.on('pointerdown', this.pickItem)
      this.snack.on('pointerdown', this.pickItem)
      this.play.on('pointerdown', this.pickItem)
      this.sleep.on('pointerdown', this.pickItem)
    }

    // all icons in an array
    this.buttons = [this.shower, this.feed, this.snack, this.play, this.sleep, this.hospital]

    // refresh ui
    this.uiReady()
  }

  pickItem() {
    // if ui is blocked cannot pick item
    if (this.scene.uiBlocked) return

    // make sure the ui is ready
    this.scene.uiReady()

    // select item
    this.scene.selectedItem = this
    console.log(this.scene.selectedItem)

    this.scene.uiBlocked = true


    // adding stats up
    this.scene.updateStat(this.customStats)
    console.log(this.scene.stats)

    switch (this.texture.key) {
      case 'shower':
        this.scene.tamago.play('taking a shower')
        break

      case 'feed':
      case 'snack':
        // this.scene.uiBlocked = true
        this.scene.tamago.play('eating')
        break

      case 'play':
        // this.scene.uiBlocked = true
        this.scene.tamago.play('playing')
        break

      case 'sleep':
        // this.scene.uiBlocked = true
        this.scene.tamago.play('sleeping')
        break

      case 'hospital':
        // this.scene.uiBlocked = true
        this.isSick = false
        this.scene.tamago.play('being healthy')
        break
    }

    console.log(`picking ${this.texture.key}`)
  }

  backToDefault() {
    this.tamago.on('animationcomplete', () => {
      // check if tamago can back to default healty state 
      if (this.stats.health <= 10) {
        this.sick()

      } else if (this.stats.health > 10) {
        // back to default movement
        this.tamago.play('moving')
      }

      // ui ready for next animation
      this.uiReady()
    })
  }

  updateStat(statDifference) {

    let isGameOver = false

    for (const stat in statDifference) {
      if (statDifference.hasOwnProperty(stat)) {
        this.stats[stat] += statDifference[stat]

        // stats can't be more than max
        this.stats[stat] >= this.maxStat ? this.stats[stat] = this.maxStat : null

        // stats can't be less than zero
        if (this.stats[stat] < 0) {
          isGameOver = true
          this.stats[stat] = 0
        }
      }

      this.checkForAffection(this.stats)
      this.stats.affection >= this.affectionMaxStat ? this.stats.affection = this.affectionMaxStat : null


    }

    // refresh HUD
    this.refreshHUD()
    // if (isGameOver) this.gameOver()
  }

  checkForAffection(stat) {
    // if (stat.hunger >= 70 && stat.hygine >= 70 && stat.fun && !this.isSick) {
    //   stat.affection += 10
    // } else if (this.isSick) {
    //   stat.affection += -30
    // }
    stat.hunger >= 70 && stat.hygine >= 70 && stat.fun ? stat.affection += 10 : stat.affection += 0
  }

  uiReady() {
    // initialize selected item
    // this.selectedItem = null

    // scene unblocked
    this.uiBlocked = false
  }

  statbarMaker() {
    const margin = 50
    const textConfig = {
      font: '24px',
      fill: '#000'
    }


    this.hungerText = this.add.text(200, 90, 'Hunger', textConfig)
    this.hygineText = this.add.text(450, 90, 'Hygine', textConfig)
    this.funText = this.add.text(720, 90, 'Fun', textConfig)
    this.affectionText = this.add.text(930, 90, 'Affection', textConfig)

    const bar = {
      width: 206,
      height: 30
    }

    this.hungerBar = this.add.graphics()
    this.hungerBar.lineStyle(3, 0x000000, 1)
    this.hungerBar.strokeRect(138, margin, bar.width, bar.height)
    this.hungerBar = this.add.rectangle(200, 30, this.percentagePresent(this.stats.hunger), 30, 0xFF2D00)

    this.hygineBar = this.add.graphics()
    this.hygineBar.lineStyle(3, 0x000000, 1)
    this.hygineBar.strokeRect(388, margin, bar.width, bar.height)

    this.funBar = this.add.graphics()
    this.funBar.lineStyle(3, 0x000000, 1)
    this.funBar.strokeRect(638, margin, bar.width, bar.height)

    this.affectionBar = this.add.graphics()
    this.affectionBar.lineStyle(3, 0x000000, 1)
    this.affectionBar.strokeRect(888, margin, bar.width, bar.height)


  }

  refreshHUD() {
    this.hungerBar.setOrigin(0, 0)
    this.hungerBar.displayWidth = this.percentagePresent(this.stats.hunger)
    this.hungerBar.fillColor = this.stats.hunger >= 40 ? 65280 : 16723200

    console.log(this.hungerBar)
    // const conditionalColorBar = (stat) => {
    //   return stat >= 50 ? '0x00ff00' : '0xFF2D00'
    // }

    // const affectionBarColor = () => {
    //   return this.stats.affection >= 25 ? '0xF9A6D0' : '0xF9A6D0'
    // }
    // this.hungerBar = this.add.graphics()
    // this.hungerBar.fillStyle(conditionalColorBar(this.stats.hunger), 1)
    // this.hungerBar.fillRect(140, 52, this.percentagePresent(this.stats.hunger), 26)

    // this.hygineBar = this.add.graphics()
    // this.hygineBar.fillStyle(conditionalColorBar(this.stats.hygine), 1)
    // this.hygineBar.fillRect(390, 52, this.percentagePresent(this.stats.hygine), 26)

    // this.funBar = this.add.graphics()
    // this.funBar.fillStyle(conditionalColorBar(this.stats.fun), 1)
    // this.funBar.fillRect(640, 52, this.percentagePresent(this.stats.fun), 26)

    // this.affectionBar = this.add.graphics()
    // this.affectionBar.fillStyle(affectionBarColor(), 1)
    // this.affectionBar.fillRect(890, 52, this.percentagePresent(this.stats.affection), 26)

    // console.log(`hungerbar: ${this.hungerBar.fillRect}`)
    // console.log(`hygineBar: ${this.hygineBar}`)
    // console.log(`funBar: ${this.funBar}`)
    // console.log(`affectionBar: ${this.affectionBar}`)
  }

  sick() {
    this.isSick = true
    this.tamago.play('sick')
    // this.stats.affection += -30
    this.hospital.on('pointerdown', this.pickItem)

    if (this.isSick) {
      console.log('tamago is sick')
    }
  }

  percentagePresent(stat) {
    // if (stat >= this.maxStat) {
    //   stat = 100
    // }
    // if (stat === this.stats.affection && stat >= this.affectionMaxStat) {
    //   stat = 50
    // }
    return stat * 2
  }

  update() {

  }
}
