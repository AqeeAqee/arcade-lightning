
music.stringPlayable("", 120)
game.stats = true
const bg = scene.backgroundImage()
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

let path: tiles.Location[] = []
let lastPath: tiles.Location[] = []
let count = 1, countSuccess = 0
tiles.setTilemap(tilemap`level2`)
// tiles.setCurrentTilemap(tilemap` `)
const tmap = game.currentScene().tileMap

function genByRandom() {
    const locTarget = new tiles.Location(mySprite.x|0, mySprite.y|0, tmap)

    let last = new tiles.Location(66, 10, tmap)
    const distTotal = Math.sqrt((mySprite.x - last.col) ** 2 + (mySprite.y - last.row))
    const distXTotal = mySprite.x - last.col
    const distYTotal = mySprite.y - last.row
    const path: tiles.Location[] = [last]
    // screen.fill(0)
    while (last.row != locTarget.row || last.col != locTarget.col) {
        const distX = (locTarget.col - last.col)
        const distY = (locTarget.row - last.row)
        // let dist = Math.min(77, Math.sqrt(distX ** 2 + distY ** 2))
        // let dist = Math.abs(distX) + Math.abs(distY) // Math.min(77, )
        let dist =  Math.max(44, ((distX) + (distY)))
        if (dist == 0) dist = .001

        // if(dist==0)game.splash("dist", dist)
        const amplitude = 3
        let row = Math.randomRange(-distY+2, distY)// / distY*1 + (distY)* amplitude / (distY + distX) * (distY > 0 ? 1 : (distY < 0 ? -1 : 0))//
        let col = Math.randomRange(-distX+2, distX)// / distX*1 + (distX)* amplitude / (distY + distX) * (distX > 0 ? 1 :(distX < 0 ? -1 : 0))//
        // let col = Math.randomRange(-1, 1)* amplitude  + distX/distXTotal*(distX > 0 ? 1 : (distX < 0 ? -1 : 0))
        // let row = Math.randomRange(-1, 1)* amplitude  + distY/distYTotal*(distY > 0 ? 1 : (distY < 0 ? -1 : 0))
        
        screen.fillRect(0, 110,160,10,0)
        screen.print([Math.roundWithPrecision(col,3), Math.roundWithPrecision(row,3)].join(),0,110,2)
        screen.fillRect(60, 40, 40, 40, 0)
        screen.setPixel(col + 80, row + 60, 5)
        screen.setPixel(80, 60, 2)
        ;pause(0)

        col += last.col
        row += last.row
        const next = new tiles.Location(col | 0, row | 0, tmap)

        if (next.row != last.row || next.col != last.col) {
            path.push(next)
            last = next
            screen.setPixel(next.col, next.row, 1); pause(0)
        }
    }
    lastPath = path
}

const minAmplitude=2
let addBranch=true
const chanceBranch=5
let length:number
function genRecursive(x1:number, y1: number, x2: number, y2: number, c:number, amplitude?:number){
    //https://krazydad.com/bestiary/bestiary_lightning.html (actually eSpark I think, lightning has braches)
    //https://en.wikipedia.org/wiki/Electric_spark

    if(!amplitude){
        length = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
        amplitude = length >> 3
        // bg.print(amplitude.toString(), 0, 0, 1)
    }
    // if((x2-x1)**2<=4&&(y2-y1)**2<=4)
    if (amplitude<=1)
        bg.drawLine(x1,y1,x2,y2,c)
    else{
        let x0 = (x2 + x1) >> 1
        let y0 = (y2 + y1) >> 1
        x0 += Math.randomRange(-amplitude-minAmplitude, amplitude+minAmplitude)
        y0 += Math.randomRange(-amplitude-minAmplitude, amplitude+minAmplitude)

        // add Branch for Lightning
        let dist:number
        if (addBranch){
            dist = (Math.abs(x1 - x2) + Math.abs(y1 - y2)) >> 1
            console.log(dist)
            const cb = [12, 12, 11, 11, 1, 1, 1, 1][(7*dist / length)|0]
            if (Math.percentChance((amplitude << 0) + chanceBranch)) { //
                genRecursive(x1, y1,
                    x0 + (-dist),
                    y0,
                    cb,
                )
            }
            if (Math.percentChance((amplitude << 0) + chanceBranch)) {
                genRecursive(x1, y1,
                    x0 + (dist),
                    y0,
                    cb,
                )
            }
        }
        amplitude >>=1
        genRecursive(x1, y1, x0, y0, c, amplitude)
        genRecursive(x0, y0, x2, y2, c, amplitude)
    }
}

game.onUpdate(() => {
    // genByRandom()
})

let msLast=0
const durationBase=15
let duration = 0,duration2=0
const amplitude:number=undefined
game.onPaint(() => {
    // controller.pauseUntilAnyButtonIsPressed()

    if(!controller.A.isPressed()){
        addBranch = true

        if (control.millis() - msLast > duration2) {
            bg.fill(0)
            msLast = control.millis()
            duration2 = Math.randomRange(5, durationBase) ** 3>>2

            // bg.drawLine( control.benchmark(()=>{
                genRecursive(80, 22, mySprite.x, mySprite.y, 1, amplitude>>2)
            // })>>6,0,0,0,1)
        }else if (control.millis() - msLast > (duration2>>2)) {
            bg.fill(0)
        }
    }else{
        bg.fill(0)
        addBranch = false
        genRecursive(80, 22, mySprite.x, mySprite.y, 1)
    }
})

controller.A.onEvent(ControllerButtonEvent.Released, function () {
    bg.fill(0)
})
