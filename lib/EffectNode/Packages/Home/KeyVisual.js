// Core Code
import { EffectNode } from "../../Core/EffectNode"

// Stack
import { Scene } from "three"
import { GLRenderer } from "../../WebGL/GLRenderer"
import { GLCamera } from "../../WebGL/GLCamera"

// Application Packages
import { ClickerBalls } from "../ClickerBalls/ClickerBalls"

export class KeyVisual extends EffectNode {
  constructor ({ el }) {
    super()
    // Application Core
    let ctx = this
    this.ctx = ctx

    this.el = el

    this.renderer = new GLRenderer({ ctx })
    this.camera = new GLCamera({ ctx })
    this.camera.position.z = 10

    this.scene = new Scene()

    ctx.onLoop(() => {
      this.renderer.render(this.scene, this.camera)
    })

    // Application Packages
    new ClickerBalls({ ctx: ctx.node({ name: 'ClickerBalls' }) })

    // console.log(ctx.services.ClickerBalls)
  }
}
