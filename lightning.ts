

namespace lightning_effect {

    interface line {
        x1: number
        y1: number
        x2: number
        y2: number
        color: number
    }

    interface position{
        x: number
        y: number
    }

    const minAmplitude = 2
    const chanceBranch = 5
    const lightnings: lightning[] = []

    export class lightning extends sprites.BaseSprite {
        private length: number
        private lines: line[] = []
        private lastGen = 0
        public updateInterval=100
        public sourceFollow: position
        public targetFollow: position

        public constructor(
            z: number,
            private x1: number,
            private y1: number,
            private x2: number,
            private y2: number,
            private color: number,
            private addBranch = false,
            private amplitude?: number
        ) {
            super(z)
            this.addBranch = addBranch
        }

        public setSourcePostion(x1: number, y1: number) {
            this.x1 = x1
            this.y1 = y1
        }

        public setTargetPostion(x2: number, y2: number) {
            this.x2 = x2
            this.y2 = y2
        }

        __drawCore(camera: scene.Camera) {
            if (this.sourceFollow) {
                this.x1 = this.sourceFollow.x
                this.y1 = this.sourceFollow.y
            }
            if (this.targetFollow) {
                this.x2 = this.targetFollow.x
                this.y2 = this.targetFollow.y
            }

            const ox = camera.drawOffsetX;
            const oy = camera.drawOffsetY;

            this.lines.forEach(l => screen.drawLine(l.x1 + ox, l.y1 + oy, l.x2 + ox, l.y2 + oy, l.color))
        }

        __update(camera: scene.Camera, dt: number) {
            /*
            let msLast = 0
            const maxDurationBase = 15
            let duration = 0
            if (control.millis() - msLast > duration) {
                bg.fill(0)
                msLast = control.millis()
                duration = Math.randomRange(5, maxDurationBase) ** 3 >> 3

                // bg.drawLine( control.benchmark(()=>{
                genRecursive(80, 22, mySprite.x, mySprite.y, 1, amplitude >> 2)
                // })>>6,0,0,0,1)
            } else if (control.millis() - msLast > (duration >> 2)) {
                bg.fill(0)
            }
            */

            if (control.millis() - this.lastGen > this.updateInterval) {
                this.lines = []
                this.genRecursive(this.x1, this.y1, this.x2, this.y2, this.color, this.amplitude)
                this.lastGen = control.millis()
            }else if (this.addBranch && control.millis() - this.lastGen > (this.updateInterval>>2)) {
                this.lines = []
            }

        }

        public destory() {
            const scene = game.currentScene();
            scene.allSprites.removeElement(this);
        }

        private genRecursive(x1: number, y1: number, x2: number, y2: number, color: number, amplitude?: number) {
            //https://krazydad.com/bestiary/bestiary_lightning.html (actually eSpark I think, lightning has braches)
            //https://en.wikipedia.org/wiki/Electric_spark

            if (!amplitude) {
                this.length = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
                amplitude = this.length >> 3
                // bg.print(amplitude.toString(), 0, 0, 1)
            }
            // if((x2-x1)**2<=4&&(y2-y1)**2<=4)
            if (amplitude <= 1)
                // bg.drawLine(x1, y1, x2, y2, c)
                this.lines.push({ x1, y1, x2, y2, color })
            else {
                let x0 = (x2 + x1) >> 1
                let y0 = (y2 + y1) >> 1
                x0 += Math.randomRange(-amplitude - minAmplitude, amplitude + minAmplitude)
                y0 += Math.randomRange(-amplitude - minAmplitude, amplitude + minAmplitude)

                // add Branch for Lightning
                let dist: number
                if (this.addBranch) {
                    dist = (Math.abs(x1 - x2) + Math.abs(y1 - y2)) >> 1
                    console.log(dist)
                    const cb = [12, 12, 11, 11, 1, 1, 1, 1][(7 * dist / this.length) | 0]
                    if (Math.percentChance((amplitude << 0) + chanceBranch)) { //
                        this.genRecursive(x1, y1,
                            x0 + (-dist),
                            y0,
                            cb,
                        )
                    }
                    if (Math.percentChance((amplitude << 0) + chanceBranch)) {
                        this.genRecursive(x1, y1,
                            x0 + (dist),
                            y0,
                            cb,
                        )
                    }
                }
                amplitude >>= 1
                this.genRecursive(x1, y1, x0, y0, color, amplitude)
                this.genRecursive(x0, y0, x2, y2, color, amplitude)
            }
        }
    }
}