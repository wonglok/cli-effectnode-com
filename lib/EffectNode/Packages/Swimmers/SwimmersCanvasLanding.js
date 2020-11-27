import { Scene } from "three"

// Stack
import { EffectNode } from "../../Core/EffectNode"
import { GLCamera } from "../../WebGL/GLCamera"
import { GLOrbit } from "../../WebGL/GLOrbit"
// import { GLBloom } from "../../WebGL/GLBloom"
import { GLRenderer } from "../../WebGL/GLRenderer"

// Application Content
import { SwimmersLanding } from "./SwimmersLanding.js"
// import { Curves } from "../Curves/Curves.js"

export class SwimmersCanvasLanding extends EffectNode {
  constructor ({ el }) {
    super()

    // App Application
    let ctx = this

    // App Resources
    this.el = el
    this.renderer = new GLRenderer({ ctx })
    this.camera = new GLCamera({ ctx })
    this.camera.position.y = 100
    this.camera.position.z = 200

    this.scene = new Scene()

    // this.scene.background = new Color('#121212')

    // new GLBloom({ ctx: ctx.node({ name: 'Bloomer' }) })
    // let bloom = ctx.services.Bloomer
    // bloom.onLoop(() => {
    //   bloom.renderSelectiveBloom()
    // })

    ctx.onLoop(() => {
      ctx.renderer.render(ctx.scene, ctx.camera)
    })

    let ctrl = new GLOrbit({ ctx })
    ctrl.enableZoom = false

    new SwimmersLanding({ ctx: ctx.node({ name: 'Swimmers' }) })

    // new Curves({ ctx: ctx.node({ name: 'Curves' }) })

    // Optimizer
    // this.logging = true
    console.log(this.internals)

    // Advanced
    // console.log(this.names)
  }
}

// context
// instnace managment (like vuejs and reactjs but in vanilla & clean code)

// Credits
// All Innovative inspirations from EffectNode are gifted from our Lord, heavenly father, Dear Jesus.

// .