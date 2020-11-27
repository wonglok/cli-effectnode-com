import * as THREE from 'three'
import anime from 'animejs/lib/anime.es.js'
import { Color } from 'three'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
const dat = require('dat.gui')

// THREE.GLTFLoader = GLTFLoader
const TWEEN = require('@tweenjs/tween.js')
// Setup the animation loop.
function animate(time) {
	requestAnimationFrame(animate)
	TWEEN.update(time)
}
requestAnimationFrame(animate)

export class EditGUI {
  constructor ({ parent, ctx }) {
    this.parent = parent
    window.gui = window.gui || new dat.GUI()
    let gui = window.gui
    let folder = gui.addFolder('Swimmer')
    folder.open()
    if (window.innerWidth <= 560) {
      folder.close()
    }

    ctx.onClean(() => {
      gui.removeFolder(folder)
    })

    // let adderV3 = (mat, kn, min, max) => {
    //   let start = kn.split('_')[0]
    //   let end = kn.split('_')[1]
    //   folder.add({ get [kn] () { return mat.uniforms[start].value[end] }, set [kn] (v) { mat.uniforms[start].value[end] = v } }, kn, min, max)
    // }

    // let addNum = (mat, kn, min, max) => {
    //   let start = kn
    //   folder.add({ gets [kn] () { return mat.uniforms[start].value }, set [kn] (v) { mat.uniforms[start].value = v } }, kn, min, max)
    // }

    // let addColor = (mat, kn) => {
    //   folder.addColor({ get [kn] () { return '#' + mat.uniforms[kn].value.getHexString() }, set [kn] (v) { mat.uniforms[kn].value.setStyle(v) } }, kn)
    // }

    let setupHead = () => {
      // adderV3(ball.material, 'spread_x', 0, 100)
      // adderV3(ball.material, 'spread_y', 0, 100)
      // adderV3(ball.material, 'spread_z', 0, 100)
      // addNum('thickness', 0, 1)
      // addNum('radiusA', -30, 30)
      // addNum('howlong', 0, 30)
      // addNum(ball.lanCurve.material, 'wiggle', -1, 1)
      // addColor('baseColor')

      folder.add({ get ['duration'] () { return parent.duration * 1000 }, set ['duration'] (v) { parent.duration = v / 1000 } }, 'duration', 0, 4.125 * 3 * 1000)
        .onChange(() => {
          window.dispatchEvent(new Event('start-tween'))
        })

      // let tt = 0
      // folder.add({ get ['noiseLevel'] () { return parent.noiseLevel * 1 }, set ['noiseLevel'] (v) { parent.noiseLevel = v / 1 } }, 'noiseLevel', 0, 100)
      //   .onChange(() => {
      //     clearTimeout(tt)
      //     tt = setTimeout(() => {
      //       parent.cleanUpScene()
      //       parent.prepAnimation({ ctx })
      //       parent.setupScene({ ctx })
      //       window.dispatchEvent(new Event('start-tween'))
      //     }, 250)
      //   })
    }
    setupHead()
  }
}

export class SwimmersLanding {
  constructor ({ ctx }) {
    this.ctx = ctx
    this.group = new THREE.Object3D()

    this.qualityFactor = 1.5
    this.scaleFactor = 5
    this.amountFactor = 250

    this.group.scale.set(this.scaleFactor * 0.75, this.scaleFactor * 0.75, this.scaleFactor * 0.75)

    this.noiseLevel = 1.0
    this.cylinderSides = 3 * this.qualityFactor
    this.segments = 12 * this.qualityFactor
    this.ctrlPts = 10

    this.restartDelay = 0
    this.duration = 4.125 * 15 // seconds

    for (let i = 0; i < this.ctrlPts; i++) {
      this[`controlPoint${i}`] = []
    }

    this.prepAnimation({ ctx })
    this.setupScene({ ctx })
    this.setupProgressValue({ ctx })

    // new EditGUI({ parent: this, ctx })
  }

  setupScene ({ ctx }) {
    ctx.scene.add(this.group)
    ctx.onClean(() => {
      ctx.scene.remove(this.group)
    })
  }

  // { ctx }
  cleanUpScene () {
    this.group.remove(this.lanCurve)
    this.group.remove(this.lanBall)
  }

  prepAnimation ({ ctx }) {
    let count = this.amountFactor
    let numSides = this.cylinderSides
    let subdivisions = this.segments
    let ctrlPts = this.ctrlPts
    let openEnded = false

    // let sine = val => Math.sin(val * Math.PI * 2.0)
    // let cosine = val => Math.cos(val * Math.PI * 2.0)
    // let rVal = () => 0.75 * (Math.random() - 0.5)
    // let radius = val => val * 10 + 2

    // let sphereV3 = new THREE.Vector3(0, 0, 0)
    let cylinder = new THREE.Vector3(0, 0, 0)

    let updateCtrlPts = () => {
      for (let eachLine = 0; eachLine < count; eachLine++) {
        for (let i = 0; i < ctrlPts; i++) {
          let ee = (eachLine / count)
          let cp = ((i / ctrlPts))

          // let xx = radius(cp) * (sine(ee) * sine(ee) - 0.5) + rVal()
          // let yy = radius(cp) * (cosine(ee) * sine(ee)) + rVal()
          // let zz = (cp - 0.5) * 10.;// + (cp) * 20.0
          let rr = 6.5 + 1.5 * Math.random()
          let angle = (ee * Math.PI * 2.0 + (cp) * Math.PI * 2.0 + (1.0 - cp) * 1.4 * Math.PI * 2.0) * 2.0 + 0.5 * Math.random() * this.noiseLevel
          let hh = Math.random() * 2.3 * this.noiseLevel
          cylinder.setFromCylindricalCoords(
            rr,
            angle,
            hh
          )
          cylinder.multiplyScalar(this.scaleFactor)

          this[`controlPoint${i}`].push(
            cylinder.x,
            cylinder.y,
            cylinder.z
          )
        }
      }
    }

    updateCtrlPts()

    let makeLib = () => {
      return `
      #define M_PI 3.1415926535897932384626433832795
      float atan2(in float y, in float x) {
        bool xgty = (abs(x) > abs(y));
        return mix(M_PI/2.0 - atan(x,y), atan(y,x), float(xgty));
      }
      vec3 fromBall(float r, float az, float el) {
        return vec3(
          r * cos(el) * cos(az),
          r * cos(el) * sin(az),
          r * sin(el)
        );
      }
      void toBall(vec3 pos, out float az, out float el) {
        az = atan2(pos.y, pos.x);
        el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
      }

      // float az = 0.0;
      // float el = 0.0;
      // vec3 noiser = vec3(lastVel);
      // toBall(noiser, az, el);
      // lastVel.xyz = fromBall(1.0, az, el);

      vec3 ballify (vec3 pos, float r) {
        float az = atan2(pos.y, pos.x);
        float el = atan2(pos.z, sqrt(pos.x * pos.x + pos.y * pos.y));
        return vec3(
          r * cos(el) * cos(az),
          r * cos(el) * sin(az),
          r * sin(el)
        );
      }

      const mat2 m = mat2(0.80,  0.60, -0.60,  0.80);

      float noise(in vec2 p) {
        return sin(p.x)*sin(p.y);
      }

      float fbm4( vec2 p ) {
          float f = 0.0;
          f += 0.5000 * noise( p ); p = m * p * 2.02;
          f += 0.2500 * noise( p ); p = m * p * 2.03;
          f += 0.1250 * noise( p ); p = m * p * 2.01;
          f += 0.0625 * noise( p );
          return f / 0.9375;
      }

      float fbm6( vec2 p ) {
          float f = 0.0;
          f += 0.500000*(0.5+0.5 * noise( p )); p = m*p*2.02;
          f += 0.250000*(0.5+0.5 * noise( p )); p = m*p*2.03;
          f += 0.125000*(0.5+0.5 * noise( p )); p = m*p*2.01;
          f += 0.062500*(0.5+0.5 * noise( p )); p = m*p*2.04;
          f += 0.031250*(0.5+0.5 * noise( p )); p = m*p*2.01;
          f += 0.015625*(0.5+0.5 * noise( p ));
          return f/0.96875;
      }

      float pattern (vec2 p, float time) {
        float vout = fbm4( p + time + fbm6( p + fbm4( p + time )) );
        return (vout);
      }

      mat3 calcLookAtMatrix (vec3 origin, vec3 target, float roll) {
        vec3 rr = vec3(sin(roll), cos(roll), 0.0);
        vec3 ww = normalize(target - origin);
        vec3 uu = normalize(cross(ww, rr));
        vec3 vv = normalize(cross(uu, ww));

        return mat3(uu, vv, ww);
      }

      float rand (vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }
      `
    }

    let getCodeLooper = () => {
      return `

      float getLooper (float t) {
        float maxLife = 0.9;
        float tailLength = 0.08;
        return min((t * tailLength + linearProgress * (maxLife - tailLength)), maxLife);
      }

      void makeNoise (inout vec3 coord, inout float t) {
        float az = 0.0;
        float el = 0.0;
        toBall(coord, az, el);

        float speed = 0.35;

        float randOffset = noise(offset.xy + offset.yz + offset.zx);

        az += pattern(vec2(az * randOffset * t, az * randOffset * t), time * speed);
        el += pattern(vec2(el * randOffset * t, el * randOffset * t), time * speed);

        coord += t * fromBall(t * pattern(t * vec2(offset.xy), 0.5), az, el);
      }
      `
    }

    let makeTubeGLSL = () => {
      let item = `
      // dough nut
      // vec3 doughNut (float t) {
      //   float angle = t * 2.0 * PI;
      //   vec2 rot = vec2(cos(angle), sin(angle));
      //   return vec3(rot, 0.0) * 1.0;
      // }

      vec3 makeLine (float t) {
        return vec3(t, t * 2.0 - 1.0, 0.0);
      }

      ${getCodeLooper()}

      // line
      vec3 sample (float t) {
        float looper = getLooper(t);
        vec3 coord = getPointAt(looper);

        makeNoise(coord, t);

        return coord;
      }

      void createTube (float t, vec2 volume, out vec3 pos, out vec3 normal) {
        // find next sample along curve
        float nextT = t + (1.0 / lengthSegments);

        // sample the curve in two places
        vec3 cur = sample(t);
        vec3 next = sample(nextT);

        // compute the Frenet-Serret frame
        vec3 T = normalize(next - cur);
        vec3 B = normalize(cross(T, next + cur));
        vec3 N = -normalize(cross(B, T));

        // extrude outward to create a tube
        float tubeAngle = angle;
        float circX = cos(tubeAngle);
        float circY = sin(tubeAngle);

        // compute position and normal
        normal.xyz = normalize(B * circX + N * circY);
        pos.xyz = cur + B * volume.x * circX + N * volume.y * circY;
      }

      vec3 makeGeo () {
        float thickness = 0.02 * 1.5 * ${(this.scaleFactor / 5.0).toFixed(3.0)};
        float t = (position * 2.0) * 0.5 + 0.5;

        vec2 volume = vec2(thickness);
        vec3 transformed;
        vec3 objectNormal;
        createTube(t, volume, transformed, objectNormal);

        // vec3 transformedNormal = normalMatrix * objectNormal;

        return transformed;
      }
      `

      return item
    }

    let getRollGLSL = ({ name = 'CONTROL_POINTS' }) => {
      let ifthenelse = ``

      // let intval = `${Number(this.ctrlPts).toFixed(0)}`
      let floatval = `${Number(this.ctrlPts).toFixed(1)}`

      for (let idx = 0; idx < this.ctrlPts; idx++) {
        ifthenelse += `
        else if (index == ${idx.toFixed(1)}) {
          result = controlPoint${idx.toFixed(0)};
        }
        `
      }

      let attrs = `
      `
      for (let idx = 0; idx < this.ctrlPts; idx++) {
        attrs += `
        attribute vec3 controlPoint${idx};
        `
      }

      let res =  `

      ${attrs}

      vec3 pointIDX_${name} (float index) {
        vec3 result = controlPoint0;

        if (false) {
        } ${ifthenelse}

        return result;
      }

      vec3 catmullRom (vec3 p0, vec3 p1, vec3 p2, vec3 p3, float t) {
          vec3 v0 = (p2 - p0) * 0.5;
          vec3 v1 = (p3 - p1) * 0.5;
          float t2 = t * t;
          float t3 = t * t * t;

          return vec3((2.0 * p1 - 2.0 * p2 + v0 + v1) * t3 + (-3.0 * p1 + 3.0 * p2 - 2.0 * v0 - v1) * t2 + v0 * t + p1);
      }

      vec3 getPointAt (float t) {
        bool closed = false;
        float ll = ${floatval};
        float minusOne = 1.0;
        if (closed) {
          minusOne = 0.0;
        }

        float p = (ll - minusOne) * t;
        float intPoint = floor(p);
        float weight = p - intPoint;

        float idx0 = intPoint + -1.0;
        float idx1 = intPoint +  0.0;
        float idx2 = intPoint +  1.0;
        float idx3 = intPoint +  2.0;

        vec3 pt0 = pointIDX_${name}(idx0);
        vec3 pt1 = pointIDX_${name}(idx1);
        vec3 pt2 = pointIDX_${name}(idx2);
        vec3 pt3 = pointIDX_${name}(idx3);

        // pt0 = controlPoint0;
        // pt1 = controlPoint1;
        // pt2 = controlPoint2;
        // pt3 = controlPoint3;

        vec3 pointoutput = catmullRom(pt0, pt1, pt2, pt3, weight);

        return pointoutput;
      }
      `
      // console.log(res);
      return res
    }

    let makeGLSLVertexLines = () => {
      return `
        precision highp float;
        #define PI 3.1415926535897932384626433832795

        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        uniform mat3 normalMatrix;

        uniform float time;
        uniform float linearProgress;

        attribute float position;
        attribute float angle;
        attribute vec2 uv;
        attribute vec3 offset;

        ${makeLib()}
        ${getRollGLSL({ name: 'CTRL' })}
        ${makeTubeGLSL()}

        varying float vT;

        void main (void) {
          vec3 nPos = makeGeo();
          // nPos += (offset * 2.0 - 1.0) * 10.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);


          float t = (position * 2.0) * 0.5 + 0.5;
          float looper = getLooper(t);

          vT = t;

          if (!(looper >= 0.01 && looper <= 0.99)) {
            gl_Position.w = 0.0;
          }
        }
      `
    }

    let makeGLSLVertexBall = () => {
      return `
        precision highp float;
        #define PI 3.1415926535897932384626433832795

        // uniform mat4 projectionMatrix;
        // uniform mat4 modelViewMatrix;
        // uniform mat3 normalMatrix;

        // attribute vec3 position;
        // attribute float angle;
        // attribute vec2 uv;

        attribute vec3 offset;

        uniform float time;
        uniform float linearProgress;

        ${makeLib()}
        ${getRollGLSL({ name: 'CTRL' })}
        ${getCodeLooper()}

        mat4 translate (float x, float y, float z){
            return mat4(
                vec4(1.0, 0.0, 0.0, 0.0),
                vec4(0.0, 1.0, 0.0, 0.0),
                vec4(0.0, 0.0, 1.0, 0.0),
                vec4(x,   y,   z,   1.0)
            );
        }

        void main (void) {
          vec3 nPos = position;

          float looper = getLooper(1.0);
          vec3 coord = getPointAt(looper);

          float noise = 1.0;
          makeNoise(coord, noise);

          gl_Position = projectionMatrix * modelViewMatrix * translate(coord.x, coord.y, coord.z) * vec4(nPos, 1.0);

          // float t = 0.0 ; // (0.0 * 2.0) * 0.5 + 0.5;
          // if (!(looper >= 0.01 && looper <= 0.99)) {
          //   gl_Position.w = 0.0;
          // }
        }
      `
    }

    let getLineMat = () => {
      return new THREE.RawShaderMaterial({
        uniforms: {
          baseColor: { value: new Color('#fafafa') },
          time: { value: 0 },
          linearProgress: { value: 0 }
        },
        transparent: true,
        side: THREE.DoubleSide,
        vertexShader: makeGLSLVertexLines(),
        fragmentShader: `
          precision highp float;
          varying float vT;
          uniform vec3 baseColor;

          void main (void) {
            gl_FragColor = vec4(baseColor, 0.85 * vT);
          }
        `,
        defines: {
          lengthSegments: subdivisions.toFixed(1)
        }
      })
    }

    let getBallMat = () => {
      return new THREE.ShaderMaterial({
        uniforms: {
          baseColor: { value: new Color('#fafafa') },
          time: { value: 0 },
          linearProgress: { value: 0 }
        },
        transparent: true,
        side: THREE.DoubleSide,
        vertexShader: makeGLSLVertexBall(),
        fragmentShader: `
          uniform vec3 baseColor;

          void main (void) {
            gl_FragColor = vec4(baseColor, 0.85);
          }
        `,
        defines: {
          // lengthSegments: subdivisions.toFixed(1)
        }
      })
    }

    let { line, ball } = new LanLanGeoSpecial({ parent: this, count, numSides, subdivisions, openEnded, ctx })
    ctx.onLoop(() => {
      let time = window.performance.now() * 0.001
      if (lanCurve) {
        lanCurve.material.uniforms.time.value = time
      }
      if (lanBall) {
        lanBall.material.uniforms.time.value = time
      }
      line.instanceCount = Math.floor(100 / 100.0 * count);
      ball.instanceCount = Math.floor(100 / 100.0 * count);
    })

    let lanBall = new THREE.Mesh(ball, getBallMat(), count);
    lanBall.frustumCulled = false
    this.lanBall = lanBall

    let lanCurve = new THREE.Mesh(line, getLineMat(), count)
    this.lanCurve = lanCurve
    lanCurve.frustumCulled = false

    // lanCurve.scale.set(1.0, 1.0, 1.0);
    // lanCurve.layers.enable(3)
    // lanCurve.layers.enable(4)
    // lanCurve.userData.bloom = true

    // ctx.scene.add(lanCurve)
    lanCurve.userData.bloom = true
    lanBall.userData.bloom = true

    this.lanCurve.userData.bloom = true
    this.lanBall.userData.bloom = true

    this.group.add(this.lanCurve)
    this.group.add(this.lanBall)
  }



  setupProgressValue () {
    // animation stuff
    // var mixer = new THREE.AnimationMixer(gltf.scene)
    // var clock = new THREE.Clock()
    // function update () {
    //   mixer.update( clock.getDelta() );
    // }
    // ctx.onLoop(() => {
    //   update()
    // })

    let animes = {}
    window.addEventListener('start-tween', () => {
      // var clip = THREE.AnimationClip.findByName(gltf.animations, 'All Animations' );
      let tempLinear = { value: 0 }
      if (animes['linear']) {
        animes['linear'].pause()
      }

      animes['linear'] = anime({
        targets: [
          tempLinear
        ],
        value: 1,
        easing: 'linear',
        duration: this.duration * 1000,
        update: () => {
          this.lanCurve.material.uniforms.linearProgress.value = tempLinear.value
          this.lanBall.material.uniforms.linearProgress.value = tempLinear.value
        },
        loopComplete: () => {
          setTimeout(() => {
            animes['linear'].play()
          }, this.restartDelay * 1000)
        }
      })
    })
    window.dispatchEvent(new CustomEvent('start-tween', { detail: {} }))
  }
}

class LanLanGeoSpecial {
  constructor ({ parent, count = 100, numSides = 8, subdivisions = 50, openEnded = true, ctx }) {
    this.parent = parent
    // create a base CylinderGeometry which handles UVs, end caps and faces
    const radius = 1;
    const length = 1;
    const baseGeometry = new THREE.CylinderGeometry(radius, radius, length, numSides, subdivisions, openEnded);

    // fix the orientation so X can act as arc length
    baseGeometry.rotateZ(Math.PI / 2);

    // compute the radial angle for each position for later extrusion
    const tmpVec = new THREE.Vector2();
    const xPositions = [];
    const angles = [];
    const uvs = [];
    const vertices = baseGeometry.vertices;
    const faceVertexUvs = baseGeometry.faceVertexUvs[0];

    // Now go through each face and un-index the geometry.
    baseGeometry.faces.forEach((face, i) => {
      const { a, b, c } = face;
      const v0 = vertices[a];
      const v1 = vertices[b];
      const v2 = vertices[c];
      const verts = [ v0, v1, v2 ];
      const faceUvs = faceVertexUvs[i];

      // For each vertex in this face...
      verts.forEach((v, j) => {
        tmpVec.set(v.y, v.z).normalize();

        // the radial angle around the tube
        const angle = Math.atan2(tmpVec.y, tmpVec.x);
        angles.push(angle);

        // "arc length" in range [-0.5 .. 0.5]
        xPositions.push(v.x);

        // copy over the UV for this vertex
        uvs.push(faceUvs[j].toArray());
      })
    })

    // build typed arrays for our attributes
    const posArray = new Float32Array(xPositions);
    const angleArray = new Float32Array(angles);
    const uvArray = new Float32Array(uvs.length * 2);

    // unroll UVs
    for (let i = 0; i < posArray.length; i++) {
      const [u, v] = uvs[i]
      uvArray[i * 2 + 0] = u
      uvArray[i * 2 + 1] = v
    }

    const lineGeo = new THREE.InstancedBufferGeometry()
    lineGeo.instanceCount = count

    lineGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 1))
    lineGeo.setAttribute('angle', new THREE.BufferAttribute(angleArray, 1))
    lineGeo.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2))

    let offsets = []
    let ddxyz = Math.ceil(Math.pow(count, 1 / 3))
    for (let z = 0; z < ddxyz; z ++ ) {
      for (let y = 0; y < ddxyz; y ++ ) {
        for (let x = 0; x < ddxyz; x ++ ) {
          offsets.push(
            x / ddxyz,
            y / ddxyz,
            z / ddxyz
          )
        }
      }
    }

    for (let i = 0; i < this.parent.ctrlPts; i++) {
      lineGeo.setAttribute('controlPoint' + i, new THREE.InstancedBufferAttribute(new Float32Array(this.parent[`controlPoint${i}`]), 3));
    }
    lineGeo.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array( offsets ), 3));

    // let ballBaseGeo = new THREE.SphereBufferGeometry(0.025, 32, 32)
    let bRadius = 0.025 * 2.5 * 1.5 * (this.parent.scaleFactor / 5.0)
    // let ballBaseGeo = new THREE.BoxBufferGeometry(bRadius, bRadius, bRadius, 1.0, 1.0, 1.0)
    let ballBaseGeo = new THREE.IcosahedronBufferGeometry(bRadius, 1)

    let ballGeo = new THREE.InstancedBufferGeometry()
    ballGeo.instanceCount = count
    ballGeo.setAttribute('position', new THREE.BufferAttribute(ballBaseGeo.attributes.position.array, 3))
    ballGeo.setAttribute('uv', new THREE.BufferAttribute(ballBaseGeo.attributes.uv.array, 2))
    ballGeo.setAttribute('normal', new THREE.BufferAttribute(ballBaseGeo.attributes.normal.array, 3))

    for (let i = 0; i < this.parent.ctrlPts; i++) {
      ballGeo.setAttribute('controlPoint' + i, new THREE.InstancedBufferAttribute(new Float32Array(this.parent[`controlPoint${i}`]), 3));
    }
    ballGeo.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));

    ctx.onClean(() => {
      lineGeo.dispose()
      ballGeo.dispose()
      baseGeometry.dispose()
    })

    return {
      line: lineGeo,
      ball: ballGeo
    }
  }
}
//