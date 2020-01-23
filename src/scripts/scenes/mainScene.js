export default class MainScene extends Phaser.Scene {

  constructor() {
    super({ key: 'MainScene' })
  }

  init() {
    // grown stage 
    this.stage = {
      baby: 'tamago',
      toddler: 'hanpen'
    }

    // stats
    this.stats = {
      hunger: 70,
      fun: 70,
      hygine: 70,
      affection: 1,
      health: 50
    }

    // stat rate
    this.statRate = {
      feed: { hunger: 20, health: 5 },
      snack: { hunger: 10, fun: 10 },
      play: { fun: 20 },
      shower: { hygine: 100, health: 5 },
      hostpital: { health: 50 }
    }

    // initialise currentstage
    this.currentStage = this.stage.baby

    // max stat
    this.maxStat = 100
    this.affectionMaxStat = this.currentStage === this.stage.baby ? 50 : 100

    // decay parameters
    this.decayRates = {
      hunger: -5,
      fun: -5,
      hygine: -5,
      affection: -2,
      health: -2
    }

    // sickness condition 
    // this.isSick = this.stats.health <= 20
    // console.log(this.isSick)
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

    // load animation
    this.animations('tamago')
    this.animations('hanpen')
  }

  create() {
    const canvasWidth = this.game.canvas.width
    const canvasHeight = this.game.canvas.height

    this.pet = this.add.sprite(canvasWidth / 2, canvasHeight / 2, 'pets', `assets/img/${this.currentStage}00.png`).setScale(2).setInteractive()
    this.pet.play(`${this.currentStage}-moving`)
    console.log(this.pet)

    this.statbarMaker()
    this.refreshHUD()
    this.interface(canvasWidth, canvasHeight - 50)

    // decay of stats over time
    this.timedEventStats = this.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        if (this.selectedItem === this.sleep) {
          return
        } else {
          // update stats
          this.updateStat(this.decayRates)

          if (this.stats.health <= 20) {
            this.sick()
          }
        }

      },
      callbackScope: this
    })

    // growing to toddler
    this.toToddler = this.time.addEvent({
      delay: 3000,
      repeat: 0,
      callback: () => {
        this.currentStage = this.stage.toddler
        this.pet.setFrame('hanpen00.png')
        this.pet.play(`${this.currentStage}-moving`)

        console.log('tamago grown to hanpen!')
      },
      callbackScope: this
    })


    console.log(`global ${this.pet}`)

    // on Animation completion
    this.pet.on('animationcomplete', () => {
      this.backToDefault()
      console.log('animation completed!')
      // this.shutDownCheck()

      // ui ready for next animation
      this.uiReady()
      console.log(this.currentStage)
    }, this)

  }

  interface(screenW, screenH) {
    const margin = 200

    // add icons on interface
    this.shower = this.add.sprite((screenW - margin) / 6, screenH, 'shower')
      .setScale(1.5).setInteractive()
    this.shower.customStats = this.statRate.shower

    this.feed = this.add.sprite((screenW - margin) / 6 * 2, screenH, 'feed')
      .setScale(1.5).setInteractive()
    this.feed.customStats = this.statRate.feed

    this.snack = this.add.sprite((screenW - margin) / 6 * 3, screenH, 'snack')
      .setScale(1.5).setInteractive()
    this.snack.customStats = this.statRate.snack

    this.play = this.add.sprite((screenW - margin) / 6 * 4, screenH, 'play')
      .setScale(1.5).setInteractive()
    this.play.customStats = this.statRate.play

    this.sleep = this.add.sprite((screenW - margin) / 6 * 5, screenH, 'sleep')
      .setScale(1.5).setInteractive()

    this.hospital = this.add.sprite((screenW - margin), screenH, 'hospital')
      .setScale(1.5).setInteractive()
    this.hospital.customStats = this.statRate.hospital


    //disable hospital interaction initially
    this.hospital.disableInteractive()

    // all icons in an array
    this.buttons = [this.shower, this.feed, this.snack, this.play, this.sleep, this.hospital]

    // ui unblock
    this.uiBlocked = false

    // if tamago is sick 
    this.isSick = false

    this.shutDownCheck()

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

    this.scene.uiBlocked = true

    const stage = this.scene.currentStage

    // adding stats up
    this.scene.updateStat(this.customStats)
    console.log(this.scene.stats)

    switch (this.texture.key) {
      case 'shower':
        this.scene.pet.play(`${stage}-taking a shower`)
        break

      case 'feed':
      case 'snack':
        this.scene.pet.play(`${stage}-eating`)
        break

      case 'play':
        this.scene.pet.play(`${stage}-playing`)
        break

      case 'sleep':
        this.scene.pet.play(`${stage}-sleeping`)
        break

      case 'hospital':
        this.isSick = false
        this.scene.pet.play(`${stage}-being healthy`)
        this.disableInteractive()
        break
    }

    console.log(`picking ${this.texture.key}`)
  }

  backToDefault() {
    // check if tamago can back to default healty state 
    if (this.stats.health <= 20) {
      this.sick()

    } else {
      // back to default movement
      this.pet.play(`${this.currentStage}-moving`)
      console.log('back to default: current stage is' + this.currentStage)
    }
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
    console.log(`updated stat`)
    this.refreshHUD()
    // this.backToDefault()
    // if (isGameOver) this.gameOver()
  }

  checkForAffection(stat) {
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
    this.hungerBar = this.add.rectangle(140, 52, this.percentagePresent(this.stats.hunger), 26, 0xFF2D00)

    this.hygineBar = this.add.graphics()
    this.hygineBar.lineStyle(3, 0x000000, 1)
    this.hygineBar.strokeRect(388, margin, bar.width, bar.height)
    this.hygineBar = this.add.rectangle(390, 52, this.percentagePresent(this.stats.hygine), 26, 0xFF2D00)

    this.funBar = this.add.graphics()
    this.funBar.lineStyle(3, 0x000000, 1)
    this.funBar.strokeRect(638, margin, bar.width, bar.height)
    this.funBar = this.add.rectangle(640, 52, this.percentagePresent(this.stats.fun), 26, 0xFF2D00)

    this.affectionBar = this.add.graphics()
    this.affectionBar.lineStyle(3, 0x000000, 1)
    this.affectionBar.strokeRect(888, margin, bar.width, bar.height)
    this.affectionBar = this.add.rectangle(890, 52, this.percentagePresent(this.stats.affection), 26, 0xeb3458)
  }

  refreshHUD() {
    const greenOrRed = (stat) => stat >= 40 ? 65280 : 16723200
    const pink = this.stats.affection <= 50 ? 16361168 : 15414360

    this.hungerBar.setOrigin(0, 0)
    this.hungerBar.displayWidth = this.percentagePresent(this.stats.hunger)
    this.hungerBar.fillColor = greenOrRed(this.stats.hunger)

    this.hygineBar.setOrigin(0, 0)
    this.hygineBar.displayWidth = this.percentagePresent(this.stats.hygine)
    this.hygineBar.fillColor = greenOrRed(this.stats.hygine)

    this.funBar.setOrigin(0, 0)
    this.funBar.displayWidth = this.percentagePresent(this.stats.fun)
    this.funBar.fillColor = greenOrRed(this.stats.fun)

    this.affectionBar.setOrigin(0, 0)
    this.affectionBar.displayWidth = this.percentagePresent(this.stats.affection)
    this.affectionBar.fillColor = pink


  }

  sick() {
    this.isSick = true
    this.pet.play(`${this.currentStage}-sick`)
    this.hospital.setInteractive()

    if (this.isSick) {
      console.log(`${this.currentStage} is sick`)
    }
  }

  percentagePresent(stat) {

    return stat * 2
  }

  animations(stage) {
    const Animconfig = (prefix, start, end) => {
      const animconfig = {
        prefix: prefix,
        suffix: '.png',
        start: start,
        end: end,
        zeroPad: 2
      }
      return animconfig
    }

    const keys = [`${stage}-moving`, `${stage}-sick`, `${stage}-sleeping`, `${stage}-taking a shower`, `${stage}-playing`, `${stage}-eating`, `${stage}-being healthy`]

    for (const key of keys) {
      let config
      let repeat

      switch (key) {
        case `${stage}-moving`:
          config = Animconfig(stage, 0, 2)
          repeat = -1
          break

        case `${stage}-sick`:
          config = Animconfig(stage, 5, 6)
          repeat = -1
          break
        case `${stage}-sleeping`:
          config = Animconfig(stage, 11, 12)
          repeat = -1
          break

        case `${stage}-taking a shower`:
          config = Animconfig(stage, 9, 10)
          repeat = 3
          break

        case `${stage}-playing`:
          config = Animconfig(stage, 7, 8)
          repeat = 3
          break

        case `${stage}-eating`:
          config = Animconfig(stage, 3, 4)
          repeat = 3
          break

        case `${stage}-being healthy`:
          config = Animconfig(stage, 13, 14)
          repeat = 3
          break
      }

      let animation = this.anims.create({
        key,
        frameRate: 5,
        repeat,
        frames: this.anims.generateFrameNames('pets', config)
      })
    }

  }

  shutDownCheck() {
    if (!this.uiBlocked) {
      for (const button of this.buttons) {
        button.on('pointerdown', this.pickItem)
      }

    }
    console.log(`shutDownCheck: ${this.uiBlocked}`)
  }

  update() {

  }
}
