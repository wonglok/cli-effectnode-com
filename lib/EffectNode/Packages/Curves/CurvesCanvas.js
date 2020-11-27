// Core Code
import { EffectNode } from "../../Core/EffectNode"

// Stack
import { Color, Scene } from "three"
import { GLRenderer } from "../../WebGL/GLRenderer"
import { GLCamera } from "../../WebGL/GLCamera"

// Application Packages
import { Curves } from "../Curves/Curves"

export class CurvesCanvas extends EffectNode {
  constructor ({ el }) {
    super()

    // Application Core
    let ctx = this
    this.el = el

    this.renderer = new GLRenderer({ ctx })
    this.camera = new GLCamera({ ctx })
    this.camera.position.z = 10

    this.scene = new Scene()
    this.scene.background = new Color('#121212')

    this.onLoop(() => {
      this.renderer.render(this.scene, this.camera)
    })

    new Curves({ ctx: ctx.node({ name: 'CurveService' }) })
  }
}
