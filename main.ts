
game.stats = true
scene.setBackgroundImage(storySprites.castle)
tiles.setCurrentTilemap(tilemap`level1`)

let mySprite = sprites.create(img`
    . . . . . . f f f f . . . . . .
    . . . . f f f 2 2 f f f . . . .
    . . . f f f 2 2 2 2 f f f . . .
    . . f f f e e e e e e f f f . .
    . . f f e 2 2 2 2 2 2 e e f . .
    . . f e 2 f f f f f f 2 e f . .
    . . f f f f e e e e f f f f . .
    . f f e f b f 4 4 f b f e f f .
    . f e e 4 1 f d d f 1 4 e e f .
    . . f e e d d d d d d e e f . .
    . . . f e e 4 4 4 4 e e f . . .
    . . e 4 f 2 2 2 2 2 2 f 4 e . .
    . . 4 d f 2 2 2 2 2 2 f d 4 . .
    . . 4 4 f 4 4 5 5 4 4 f 4 4 . .
    . . . . . f f f f f f . . . . .
    . . . . . f f . . f f . . . . .
`, SpriteKind.Player)
controller.moveSprite(mySprite)
mySprite.setPosition(140,110)
// scene.cameraFollowSprite(mySprite)

const lightning = new lightning_effect.lightning(-1, 40, 11, mySprite.x, mySprite.y, 1, true)
lightning.targetFollow = mySprite
lightning.updateInterval=222
lightning.lifespan=500

const sparks:lightning_effect.lightning[]=[]

sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Projectile, function(s1: Sprite, s2: Sprite) {
    s1.vx = -s1.vx
    s1.vy = -s1.vy
    s2.vx = -s2.vx
    s2.vy = -s2.vy
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    let ball = sprites.createProjectileFromSprite(img`
    . . . . . b b b b b b . . . . .
    . . . b b 9 9 9 9 9 9 b b . . .
    . . b b 9 9 9 9 9 9 9 9 b b . .
    . b b 9 d 9 9 9 9 9 9 9 9 b b .
    . b 9 d 9 9 9 9 9 1 1 1 9 9 b .
    b 9 d d 9 9 9 9 9 1 1 1 9 9 9 b
    b 9 d 9 9 9 9 9 9 1 1 1 9 9 9 b
    b 9 3 9 9 9 9 9 9 9 9 9 1 9 9 b
    b 5 3 d 9 9 9 9 9 9 9 9 9 9 9 b
    b 5 3 3 9 9 9 9 9 9 9 9 9 d 9 b
    b 5 d 3 3 9 9 9 9 9 9 9 d d 9 b
    . b 5 3 3 3 d 9 9 9 9 d d 5 b .
    . b d 5 3 3 3 3 3 3 3 d 5 b b .
    . . b d 5 d 3 3 3 3 5 5 b b . .
    . . . b b 5 5 5 5 5 5 b b . . .
    . . . . . b b b b b b . . . . .
`, mySprite, 50, 50)
    ball.setBounceOnWall(true)
    ball.setFlag(SpriteFlag.AutoDestroy, false)
    ball.setFlag(SpriteFlag.DestroyOnWall, false)
    // ball.lifespan = 3000

    const spark = new lightning_effect.lightning(-1, 22, 11, mySprite.x, mySprite.y, 1, false)
    spark.targetFollow = mySprite
    spark.sourceFollow = ball
    spark.updateInterval = 20
    // spark.lifespan=2000
    sparks.push(spark)
    spark.onRequestColor(()=>{return Math.pickRandom([1,3,10,15])})
    ball.onDestroyed(()=>{
        spark.destory()
    })
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function() {
    const spark= sparks.pop()
    if(spark){
        (spark.sourceFollow as Sprite).destroy()
    }

    lightning.lifespan = 30000
})

controller.B.onEvent(ControllerButtonEvent.Released, function () {
    lightning.lifespan = 0

})

for (let i = 0; i < 0; i++) {
    controller.A.setPressed(true)
    controller.A.setPressed(false)
    pause(200)
}
