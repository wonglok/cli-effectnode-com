import { PerspectiveCamera } from "three"

export class GLCamera {
  constructor ({ ctx }) {
    let el = ctx.el

    this.rect = el.getBoundingClientRect()
    this.aspectRatio = this.rect.width / this.rect.height

    let camera = new PerspectiveCamera(65, this.aspectRatio, 0.0000001, 10000000.0)

    ctx.onResize(() => {
      this.rect = el.getBoundingClientRect()
      this.aspectRatio = this.rect.width / this.rect.height
      camera.aspect = this.aspectRatio
      camera.updateProjectionMatrix()
    })

    return camera
  }
}
