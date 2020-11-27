import './GLRenderer.css'
import { sRGBEncoding, WebGLRenderer } from "three"

export class GLRenderer {
  constructor ({ ctx }) {
    let renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      outputEncoding: sRGBEncoding
    })

    let el = ctx.el
    this.rect = el.getBoundingClientRect()
    this.aspectRatio = this.rect.width / this.rect.height
    ctx.onResize(() => {
      this.rect = el.getBoundingClientRect()
      this.aspectRatio = this.rect.width / this.rect.height
      renderer.setSize(this.rect.width, this.rect.height)
      let dpi = window.devicePixelRatio || 1.0
      renderer.setPixelRatio(dpi)
    })

    el.appendChild(renderer.domElement)
    ctx.onClean(() => {
      let dom = renderer.domElement
      dom.parentNode.removeChild(dom)
    })

    return renderer
  }
}
