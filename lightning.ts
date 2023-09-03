

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

    const minAmplitude = 3
    const minChanceBranch = 2

    export class lightning extends sprites.BaseSprite {
        private length: number
        private lines: line[] = []
        private lastGen = 0
        public updateInterval=100
        public sourceFollow: position
        public targetFollow: position
        public handlerOnGetColor: () => number
        public lifespan:number

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

        public onRequestColor(handler:()=>number){
            if(handler)
                this.handlerOnGetColor=handler
        }

        public setSourcePostion(x1: number, y1: number) {
            this.x1 = x1
            this.y1 = y1
            this.sourceFollow=undefined
        }

        public setTargetPostion(x2: number, y2: number) {
            this.x2 = x2
            this.y2 = y2
            this.targetFollow=undefined
        }

        __drawCore(camera: scene.Camera) {
            if (this.lifespan <= 0) {
                this.lines = []
                return
            }
            const ox = camera.drawOffsetX;
            const oy = camera.drawOffsetY;

            this.lines.forEach(l => screen.drawLine(l.x1 - ox, l.y1 - oy, l.x2 - ox, l.y2 - oy, l.color))
        }

        __update(camera: scene.Camera, dt: number) {
            if (this.lifespan) {
                this.lifespan -= dt*1000
                if (this.lifespan <= 0) {
                    // this.destory()
                    this.lines = []
                    return
                }
            }

            if (this.sourceFollow) {
                this.x1 = this.sourceFollow.x
                this.y1 = this.sourceFollow.y
            }
            if (this.targetFollow) {
                this.x2 = this.targetFollow.x
                this.y2 = this.targetFollow.y
            }

            if (control.millis() - this.lastGen > this.updateInterval ) {//
                this.lines = []
                // this.lines.splice(0, this.lines.length)
                if (this.handlerOnGetColor)
                    this.color=this.handlerOnGetColor()

                this.length=undefined
                this.genRecursive(this.x1, this.y1, this.x2, this.y2, this.color, this.amplitude)
                this.lastGen = control.millis()
                // this.updateInterval = 50 * (this.lines.length) ** 2 / this.length
                this.updateInterval= (this.lines.length<<1)+70
                info.setScore(this.updateInterval)
            }else if (control.millis() - this.lastGen > this.updateInterval>>2) {
                this.lines=[]
                // this.lines.splice(0, this.lines.length)
            }
        }

        public destory() {
            this.sourceFollow=undefined
            this.targetFollow=undefined
            const scene = game.currentScene();
            scene.allSprites.removeElement(this);
            this.lifespan = undefined
            this.lines.splice(0, this.lines.length)
        }

        private genRecursive(x1: number, y1: number, x2: number, y2: number, color: number, amplitude?: number) {
            //https://krazydad.com/bestiary/bestiary_lightning.html (actually eSpark I think, lightning has braches)
            //https://en.wikipedia.org/wiki/Electric_spark

            if (!amplitude) {
                const len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
                if(len>500) return
                if (!this.length)
                    this.length = len
                // console.log([this.length, x1, y1, x2, y2].join())
                amplitude = len >> 3
            }
            if (amplitude <= 1)
                this.lines.push({ x1, y1, x2, y2, color })
            else {
                let range = amplitude/2 + minAmplitude
                let x0 = ((x2 + x1) >> 1) + Math.randomRange(-range, range)
                let y0 = ((y2 + y1) >> 1) + Math.randomRange(-range, range)

                // add Branch for Lightning
                let distX: number
                if (this.addBranch) {
                    const chanceBranch = (amplitude*2+ minChanceBranch)>>2
                    const b1 = Math.percentChance(chanceBranch)
                    const b2 = Math.percentChance(chanceBranch)
                    if(b1||b2){
                        distX = Math.max(Math.abs(y0 - this.y2)/2,(Math.abs(x0 - this.x2) ) >> 4)
                        // const cb = [12, 12, 11, 11, 1, 1, 1, 1][Math.idiv(8 * dist, this.length)]
                        // if (b1)
                        //     this.genRecursive(x1, y1, x0 - dist, y0, color)
                        // if (b2)
                        //     this.genRecursive(x1, y1, x0 + dist, y0, color)
                        range >>= 1
                        if (b1)
                            this.genRecursive(x0, y0, (x0 + this.x2) / 2 - distX + Math.randomRange(-range, range), (y0+this.y2)/2 + Math.randomRange(-range, range), color)
                        if (b2)
                            this.genRecursive(x0, y0, (x0 + this.x2) / 2 + distX + Math.randomRange(-range, range), (y0 + this.y2) / 2+ Math.randomRange(-range, range), color)
                    }
                }
                amplitude >>= 1
                this.genRecursive(x1, y1, x0, y0, color, amplitude)
                this.genRecursive(x0, y0, x2, y2, color, amplitude)
            }
        }
    }
}