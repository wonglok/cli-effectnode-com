import { Color, Mesh, MeshBasicMaterial, SphereBufferGeometry } from "three"
import anime from 'animejs/lib/anime.es.js'

export class Bally {
  constructor ({ ctx, props }) {
    this.ctx = ctx
    this.props = props

    let geo = new SphereBufferGeometry(1, 32, 32)
    let mat = new MeshBasicMaterial({ color: new Color('#babaff'), wireframe: true, opacity: 0, transparent: true })
    let mesh = new Mesh(geo, mat)
    ctx.scene.add(mesh)

    ctx.onLoop(() => {
      mesh.rotation.y += 0.003
    })

    mesh.position.x = (Math.random() - 0.5) * 10
    mesh.position.y = (Math.random() - 0.5) * 10

    ctx.onClean(() => {
      mesh.geometry.dispose()
      mesh.material.dispose()
      ctx.scene.remove(mesh)
    })

    ctx.on('fadein', ({ done = () => {} }) => {
      anime({
        targets: [mat],
        duration: 1000,
        opacity: 1,
        easing: 'cubicBezier(.5, .05, .1, .3)',
        begin: () => {
          mat.opacity = 0
        },
        complete: () => {
          done()
        }
      })
    })

    ctx.on('fadeout', ({ done = () => {} }) => {
      anime({
        targets: [mat],
        duration: 1000,
        opacity: 0,
        easing: 'cubicBezier(.5, .05, .1, .3)',
        begin: () => {
          mat.opacity = 1
        },
        complete: () => {
          done()
        }
      })
    })
  }
}
