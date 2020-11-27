import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectNode } from '../Core/EffectNode'
export class GLOrbit extends EffectNode {
  constructor ({ ctx }) {
    super({ ctx })

    this.ctx = ctx

    let ctrls = new OrbitControls(ctx.camera, ctx.renderer.domElement)
    ctrls.enableDamping = true
    ctrls.dampingFactor = 0.06
    ctx.onLoop(() => {
      ctrls.update()
    })

    return ctrls
  }
}