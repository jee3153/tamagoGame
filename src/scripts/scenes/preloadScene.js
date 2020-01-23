export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }
  // init(data) {
  //   // grown stage 
  //   this.stage = data.stage

  // }

  preload() {
    // load atlas
    this.load.atlas('pets', 'assets/img/sprites.png', 'assets/img/sprites.json')



    // // // load spritesheet
    // this.load.spritesheet('tamago', 'assets/img/tamago-spritesheet.png', {
    //   frameWidth: 60,
    //   frameHeight: 60
    // })

    // this.load.spritesheet('hanpen', 'assets/img/hanpen-spritesheet.png', {
    //   frameWidth: 60,
    //   frameHeight: 60
    // })


  }

  create() {
    // this.stage = 'tamago'
    // animations
    // this.anims.create({
    //   key: 'moving',
    //   frames: this.anims.generateFrameNames(this.stage, { start: 0, end: 2 }),
    //   frameRate: 5,
    //   repeat: -1
    // })

    // this.anims.create({
    //   key: 'sick',
    //   frames: this.anims.generateFrameNames(this.stage, { frames: [5, 6] }),
    //   frameRate: 5,
    //   repeat: -1
    // })

    // this.anims.create({
    //   key: 'sleeping',
    //   frames: this.anims.generateFrameNames(this.stage, { frames: [11, 12] }),
    //   frameRate: 5,
    //   repeat: -1
    // })

    // this.anims.create({
    //   key: 'taking a shower',
    //   frames: this.anims.generateFrameNames(this.stage, { frames: [9, 10] }),
    //   frameRate: 5,
    //   repeat: 3
    // })

    // this.anims.create({
    //   key: 'being healthy',
    //   frames: this.anims.generateFrameNames(this.stage, { frames: [13, 14] }),
    //   frameRate: 5,
    //   repeat: 3
    // })

    // this.anims.create({
    //   key: 'playing',
    //   frames: this.anims.generateFrameNames(this.stage, { frames: [7, 8] }),
    //   frameRate: 5,
    //   repeat: 3
    // })

    // this.anims.create({
    //   key: 'eating',
    //   frames: this.anims.generateFrameNames(this.stage, { frames: [3, 4] }),
    //   frameRate: 5,
    //   repeat: 3
    // })
    this.scene.start('MainScene')
    // this.scene.start('MainScene', { stage: this.stage })


    /**
     * This is how you would dynamically import the mainScene class (with code splitting),
     * add the mainScene to the Scene Manager
     * and start the scene.
     * The name of the chunk would be 'mainScene.chunk.js
     * Find more about code splitting here: https://webpack.js.org/guides/code-splitting/
     */
    // let someCondition = true
    // if (someCondition)
    //   import(/* webpackChunkName: "mainScene" */ './mainScene').then(mainScene => {
    //     this.scene.add('MainScene', mainScene.default, true)
    //   })
    // else console.log('The mainScene class will not even be loaded by the browser')
  }
}
