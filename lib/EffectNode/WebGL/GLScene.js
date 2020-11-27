import { Scene } from "three"

export class GLScene {
  constructor ({ ctx }) {
    let ctrls = new Scene(ctx.camera, ctx.renderer.domElement)
    ctrls.enableDamping = true
    ctrls.dampingFactor = 0.06
    ctx.onLoop(() => {
      ctrls.update()
    })

    return ctrls
  }
}