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
      hunger: 60,
      fun: 60,
      hygine: 60,
      affection: 1,
      health: 60
    }

    // stat rate
    this.statRate = {
      feed: { hunger: 20, health: 5 },
      snack: { hunger: 10, fun: 10 },
      play: { fun: 20 },
      shower: { hygine: 100, health: 2 },
      hospital: { health: 60 }
    }

    // initialise currentstage
    this.currentStage = this.stage.baby

    // max stat
    this.maxStat = 100
    this.affectionMaxStat = this.currentStage === this.stage.baby ? 50 : 100

    // decay parameters
    this.decayRates = {
      hunger: -5,
      fun: -4,
      hygine: -7,
      affection: -2,
      health: -3
    }

    // initialise if it's gameover
    this.isGameOver = false

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

    // load background
    this.load.image('bg', 'assets/img/bg.png')
  }

  create() {
    const canvasWidth = this.game.canvas.width
    const canvasHeight = this.game.canvas.height

    console.log(`width:${canvasWidth} height: ${canvasHeight}`)

    this.pet = this.add.sprite(canvasWidth / 2, canvasHeight / 2, 'pets', `assets/img/${this.currentStage}00.png`).setScale(2).setInteractive()
    this.pet.depth = 2
    this.pet.play(`${this.currentStage}-moving`)

    this.statbarMaker()
    this.refreshHUD()
    this.interface(canvasWidth, canvasHeight - 50)

    // decay of stats over time
    this.timedEventStats = this.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        // if sleep is selected no stat update
        if (this.selectedItem === this.sleep || this.isGameOver) {
          return
        } else {
          // update stats
          this.updateStat(this.decayRates)
          // decide which animation to play depending on updated stat
          this.backToDefault()
        }

      },
      callbackScope: this
    })

    // growing to toddler
    this.toToddler = this.time.addEvent({
      delay: 300000, // 3mins late it becomes toddler
      repeat: 0,
      callback: () => {
        this.currentStage = this.stage.toddler
        this.pet.setFrame(`${this.currentStage}00.png`)
        this.pet.play(`${this.currentStage}-moving`)

        console.log('tamago grown to hanpen!')
      },
      callbackScope: this
    })

    // on Animation completion
    this.pet.on('animationcomplete', () => {
      // check if game is over
      if (this.isGameOver) return

      this.backToDefault()
      console.log('animation completed!')

      // ui ready for next animation
      this.uiReady()

      // ui unblock
      this.UIunblock()

      //ui buttons transparency
      for (const button of this.buttons) {
        if (button === this.hospital) continue
        button.alpha = 1
      }

    }, this)

  }

  interface(screenW, screenH) {
    const margin = 200

    // add icons on interface
    this.shower = this.add.sprite((screenW - margin) / 6, screenH, 'shower')
    this.shower.customStats = this.statRate.shower

    this.feed = this.add.sprite((screenW - margin) / 6 * 2, screenH, 'feed')
    this.feed.customStats = this.statRate.feed

    this.snack = this.add.sprite((screenW - margin) / 6 * 3, screenH, 'snack')
    this.snack.customStats = this.statRate.snack

    this.play = this.add.sprite((screenW - margin) / 6 * 4, screenH, 'play')
    this.play.customStats = this.statRate.play

    this.sleep = this.add.sprite((screenW - margin) / 6 * 5, screenH, 'sleep')

    this.hospital = this.add.sprite((screenW - margin), screenH, 'hospital')
    this.hospital.customStats = this.statRate.hospital

    // all icons in an array
    this.buttons = [this.shower, this.feed, this.snack, this.play, this.sleep, this.hospital]

    // ui unblock
    this.uiBlocked = false
    // attatch pick events on buttons
    this.ButtonEvents(this.pickItem)

    //disable hospital interaction initially
    this.hospital.disableInteractive()
    this.hospital.alpha = 0.5
    // refresh ui
    this.uiReady()


  }

  pickItem() {
    const stage = this.scene.currentStage

    // if ui is blocked cannot pick item
    if (this.scene.uiBlocked) return

    // // make sure the ui is ready
    // this.scene.uiReady()

    // select item
    this.scene.selectedItem = this

    this.scene.uiBlocked = true

    // adding stats up
    this.scene.updateStat(this.customStats)
    console.log(this.scene.stats)

    switch (this.texture.key) {
      case 'shower':
        this.scene.pet.play(`${stage}-taking a shower`)
        this.scene.UIblock()
        break

      case 'feed':
      case 'snack':
        this.scene.pet.play(`${stage}-eating`)
        this.scene.UIblock()
        break

      case 'play':
        this.scene.pet.play(`${stage}-playing`)
        this.scene.UIblock()
        break

      case 'sleep':
        this.scene.pet.play(`${stage}-sleeping`)
        // this.scene.UIblock()
        break

      case 'hospital':
        this.isSick = false
        this.scene.pet.play(`${stage}-being healthy`)
        this.disableInteractive()
        this.alpha = 0.5
        this.scene.UIblock()
        break
    }

    console.log(`picking ${this.texture.key}`)
  }

  backToDefault() {


    // check if tamago can back to default healthy state 
    if (this.isSick) {
      this.sick()
      console.log(`tamago is sisk: ${this.isSick}`)
      if (this.isGameOver) {
        this.gameOver()
      }
    } else {
      // back to default movement
      this.pet.play(`${this.currentStage}-moving`)
    }
  }

  updateStat(statDifference) {
    // only stat check or update, not triggering ANIMATION CONTAINED fn

    for (const stat in statDifference) {
      if (statDifference.hasOwnProperty(stat)) {
        this.stats[stat] += statDifference[stat]

        // stats can't be more than max
        this.stats[stat] >= this.maxStat ? this.stats[stat] = this.maxStat : null

        // stats can't be less than zero
        if (this.stats[stat] < 1) {
          this.stats[stat] = 1

          // dead condition defined
          if (this.stats[stat] === this.stats.health && this.stats[stat] <= 5) {
            this.isGameOver = true
          } else {
            this.isGameOver = false
          }
        }
      }

      this.checkForAffection(this.stats)

      // set max affection stat depending on the pet's stage
      this.stats.affection >= this.affectionMaxStat ? this.stats.affection = this.affectionMaxStat : null

    }


    // sick condition defined
    if (this.stats.health <= 20) {
      this.isSick = true
      // console.log('sick() should trigger now')
    } else {
      this.isSick = false
    }

    console.log(`health: ${this.stats.health}`)

    // refresh HUD
    this.refreshHUD()
  }

  checkForAffection(stat) {
    stat.hunger >= 70 && stat.hygine >= 70 && stat.fun ? stat.affection += 10 : stat.affection += 0
  }

  uiReady() {
    // scene unblocked
    this.uiBlocked = false
  }

  statbarMaker() {
    const margin = 50
    const textConfig = {
      font: '24px',
      fill: '#000'
    }

    const barInitialising = (barName, strockX) => {
      barName = this.add.graphics()
      barName.lineStyle(3, 0x000000, 1)
      barName.strokeRect(strockX, margin, bar.width, bar.height)

    }

    const bar = {
      width: 206,
      height: 30
    }

    this.hungerText = this.add.text(200, 90, 'Hunger', textConfig)
    this.hygineText = this.add.text(450, 90, 'Hygine', textConfig)
    this.funText = this.add.text(720, 90, 'Fun', textConfig)
    this.affectionText = this.add.text(930, 90, 'Affection', textConfig)

    this.hungerBar = this.add.rectangle(140, 52, this.percentagePresent(this.stats.hunger), 26, 0xFF2D00)
    this.hygineBar = this.add.rectangle(390, 52, this.percentagePresent(this.stats.hygine), 26, 0xFF2D00)
    this.funBar = this.add.rectangle(640, 52, this.percentagePresent(this.stats.fun), 26, 0xFF2D00)
    this.affectionBar = this.add.rectangle(890, 52, this.percentagePresent(this.stats.affection), 26, 0xeb3458)

    barInitialising(this.hungerBar, 138)
    barInitialising(this.hygineBar, 388)
    barInitialising(this.funBar, 638)
    barInitialising(this.affectionBar, 888)

    this.statTexts = [this.hungerText, this.hygineText, this.funText, this.affectionText]

    this.bars = [this.hungerBar, this.hygineBar, this.funBar, this.affectionBar]
  }

  refreshHUD() {
    const greenOrRed = (stat) => stat >= 40 ? 65280 : 16723200
    const pink = this.stats.affection <= 50 ? 16361168 : 15414360

    // this.statBars = [this.hungerBar, this.hygineBar, this.funBar, this.affectionBar]

    const fillingBar = (barName, stat) => {
      barName.setOrigin(0, 0)
      barName.displayWidth = this.percentagePresent(stat)
      barName === this.affectionBar ? barName.fillColor = pink : barName.fillColor = greenOrRed(stat)
    }

    fillingBar(this.hungerBar, this.stats.hunger)
    fillingBar(this.hygineBar, this.stats.hygine)
    fillingBar(this.funBar, this.stats.fun)
    fillingBar(this.affectionBar, this.stats.affection, pink)
  }

  sick() {
    this.pet.play(`${this.currentStage}-sick`)
    this.hospital.setInteractive()
    this.hospital.alpha = 1
    this.UIblock()
  }

  percentagePresent(stat) {

    return stat * 2
  }

  UIblock() {
    this.isBlocked = true
    for (const button of this.buttons) {
      // shut down all icons except hospital
      if (button === this.hospital) continue
      button.disableInteractive()
      button.alpha = 0.5
    }


  }

  UIunblock() {
    this.isBlocked = false
    for (const button of this.buttons) {
      // turn on all icons except hospital
      if (button === this.hospital) continue
      button.setInteractive()
    }

  }

  // buttonTransparency() {
  //   for (const button of this.buttons) {
  //     if (this.isBlocked) {
  //       button.alpha = 0.5
  //     } else {
  //       button.alpha = 1
  //     }
  //   }
  // }

  ButtonEvents(eventfn) {
    for (const button of this.buttons) {
      button.setScale(1.5).setInteractive()
      button.on('pointerdown', eventfn)
    }
  }

  gameOver() {
    const gameW = this.game.canvas.width
    const gameH = this.game.canvas.height

    let bg = this.add.sprite(0, 0, 'bg').setOrigin(0, 0).setInteractive()


    let textConfig = (size, font, colorCode) => {
      let config = {
        font: `${size}px ${font}`,
        fill: colorCode
      }
      return config
    }

    let restartTrigger = () => {
      bg.on('pointerdown', () => {
        this.scene.start('MainScene')
      }, this)
    }

    let textNotice = this.add.text(gameW / 2, -50, 'YOUR TAMAGO IS DEAD...', textConfig(40, 'sans-serif', '#000'))
    let textRestart = this.add.text(gameW / 2, gameH + 50, 'CLICK TO RESTART', textConfig(30, 'sans-serif', '#000'))
    console.log('game over')

    textNotice.setOrigin(0.5, 0)
    textRestart.setOrigin(0.5, 0)

    bg.depth = 1
    textNotice.depth = 2
    textRestart.depth = 2

    this.uiBlocked = true
    this.UIblock()
    this.pet.setFrame('death00.png')
    this.pet.play('dying')

    // tween to replay
    this.timeline = this.tweens.createTimeline()

    this.timelineAdd(this.pet, -50, null, 1300)
    this.timelineAdd(textNotice, gameH / 2 - 200)
    this.timelineAdd(textRestart, gameH / 2 + 200, restartTrigger)

    this.timeline.play()

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

  update() {

  }
}
