import { RawShaderMaterial } from 'three'
import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import * as dat from 'dat.gui'

export const glsl = (v, ...args) => {
  let str = ''
  v.forEach((e, i) => {
    str += e + (args[i] || '')
  })
  return str
}

export class Curves {
  constructor ({ ctx, runEditor = true }) {
    // ctx.item

    let dimension = 3
    let size = 10
    let count = Math.pow(size, dimension)
    // let sizeX = size
    // let sizeY = size
    // let sizeZ = size

    let numSides = 5
    let subdivisions = 200
    let openEnded = false

    // let simulator = new PositionSimulation({ ctx, sizeX, sizeY })
    // this.simulator = simulator

    let geo = new LineGeo({ count, numSides, subdivisions, openEnded, dimension })

    // let geo = new BoxBufferGeometry(0.9, 2, 2, 500, 1, 1)//;

    let controlPoints = [new THREE.Vector3(-153.4197541332805, 602.2842649103882, 359.418400289163),
      new THREE.Vector3(-392.0363395266815, 570.4566516367261, -73.45548420131888),
      new THREE.Vector3(186.94941449888915, 560.3151130695674, -437.2747381058281),
      new THREE.Vector3(681.5478987247174, 102.66487050746449, -549.0420662782607),
      new THREE.Vector3(679.1265410036509, 317.9163259626413, 125.20635116261195),
      new THREE.Vector3(320.42945622005925, -1.4501254737023075, 715.1495822876569),
      new THREE.Vector3(-408.91078659800064, 221.57512686921615, 585.4569096178118),
      new THREE.Vector3(-592.084540628733, 124.02196204099367, -143.6297593666219)]

    // controlPoints.forEach(e => {
    //   e.multiplyScalar(100.0)
    // })

    let getRollGLSL = ({ name = 'CONTROL_POINTS', pts = [] }) => {
      let ifthenelse = ``

      // let intval = `${Number(pts.length).toFixed(0)}`
      let floatval = `${Number(pts.length).toFixed(1)}`

      pts.forEach((val, idx) => {
        ifthenelse += `
        else if (index == ${idx.toFixed(1)}) {
          result = vec3( ${Number(val.x).toFixed(7)}, ${Number(val.y).toFixed(7)}, ${Number(val.z).toFixed(7)} );
        }
        `
      })

      let res =  `
      vec3 pointIDX_${name} (float index) {
        vec3 result = vec3(0.0);

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

        float idx0 = intPoint - 1.0;
        float idx1 = intPoint + 0.0;
        float idx2 = intPoint + 1.0;
        float idx3 = intPoint + 2.0;

        vec3 pt0 = pointIDX_${name}(idx0);
        vec3 pt1 = pointIDX_${name}(idx1);
        vec3 pt2 = pointIDX_${name}(idx2);
        vec3 pt3 = pointIDX_${name}(idx3);

        vec3 pointoutput = catmullRom(pt0, pt1, pt2, pt3, weight);

        return pointoutput;
      }
      `
      // console.log(res);
      return res
    }

    let makeTubeGLSL = () => {
      let item = `

      attribute float position;
      attribute float angle;
      attribute vec2 uv;
      attribute vec3 offset;
      attribute vec2 reader;

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
          f += 0.500000*(0.5+0.5*noise( p )); p = m*p*2.02;
          f += 0.250000*(0.5+0.5*noise( p )); p = m*p*2.03;
          f += 0.125000*(0.5+0.5*noise( p )); p = m*p*2.01;
          f += 0.062500*(0.5+0.5*noise( p )); p = m*p*2.04;
          f += 0.031250*(0.5+0.5*noise( p )); p = m*p*2.01;
          f += 0.015625*(0.5+0.5*noise( p ));
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

      // dough nut
      // vec3 sample (float t) {
      //   float angle = t * 2.0 * PI;
      //   vec2 rot = vec2(cos(angle), sin(angle));
      //   return vec3(rot, 0.0) * 10.0;
      // }

      float rand (vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      float getLooper (float t) {
        return mod(t * 0.1 + time * 0.5 * rand(vec2(reader.x, reader.x - 0.1)), 1.0);
      }


      // line
      vec3 sample (float t) {
        float nextT = t + (1.0 / lengthSegments);
        float looper = getLooper(t);
        vec3 coord = getPointAt(looper);

        coord += coord * 0.3 * (rand(vec2(reader.x, reader.x - 0.01)) * 2.0 - 1.0);
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
        float thickness = 20.0;
        float t = (position * 2.0) * 0.5 + 0.5;

        vec2 volume = vec2(thickness / 10.0);
        vec3 transformed;
        vec3 objectNormal;
        createTube(t, volume, transformed, objectNormal);

        // vec3 transformedNormal = normalMatrix * objectNormal;

        return transformed;
      }
      `

      return item
    }

    let makeGLSLVertex = () => {
      return `
        precision highp float;
        #define PI 3.1415926535897932384626433832795
        uniform mat4 projectionMatrix;
        uniform mat4 modelViewMatrix;
        uniform mat3 normalMatrix;

        // uniforms
        uniform float time;

        ${getRollGLSL({ name: 'CONTROL_POINTS', pts: controlPoints })}

        ${makeTubeGLSL()}

        void main (void) {
          vec3 nPos = makeGeo();

          // nPos = nPos + 30.0 * normalize(nPos) * (rand(offset.xz + 20.0 * time) * 2.0 - 1.0);

          gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);

          float t = (position * 2.0) * 0.5 + 0.5;
          float looper = getLooper(t);

          if (!(looper >= 0.01 && looper <= 0.99)) {
            gl_Position.w = 0.0;
          }
        }
      `
    }

    let getMat = () => {
      return new RawShaderMaterial({
        uniforms: {
          time: { value: 0 },
          controlPoints: { value: controlPoints }
        },
        vertexShader: makeGLSLVertex(),
        fragmentShader: `
          void main (void) {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
          }
        `,
        defines: {
          lengthSegments: subdivisions.toFixed(1)
        }
      })
    }

    ctx.onLoop(() => {
      let time = window.performance.now() * 0.001
      lanCurve.material.uniforms.time.value = time

      geo.instanceCount = Math.floor(100 / 100.0 * count);
    })

    let lanCurve = new THREE.Mesh(geo, getMat(), count)
    lanCurve.frustumCulled = false
    lanCurve.userData.bloom = true
    // lanCurve.scale.set(1.0, 1.0, 1.0);
    ctx.scene.add(lanCurve)

    if (runEditor) {
      let getArr = () => {
        return controlPoints
      }
      let tout = 0
      let setArr = (v) => {
        controlPoints = v
        clearTimeout(tout)
        tout = setTimeout(() => {
          lanCurve.material = getMat()
        }, 150)
      }

      new Editor({ ctx, getArr, setArr })
    }
  }
}

class Editor {
  constructor ({ ctx, getArr, setArr }) {
    const splineHelperObjects = [];

      let splinePointsLength = 4;
			const positions = [];
			const point = new THREE.Vector3();

			const raycaster = new THREE.Raycaster();
			const pointer = new THREE.Vector2();
			const onUpPosition = new THREE.Vector2();
			const onDownPosition = new THREE.Vector2();

			const geometry = new THREE.SphereBufferGeometry(23,  32,  32);
			let transformControl;

			const ARC_SEGMENTS = 200;

			const splines = {};

			const params = {
				uniform: true,
				tension: 0.5,
				centripetal: false,
				chordal: false,
				addPoint: addPoint,
				removePoint: removePoint,
				exportSpline: exportSpline
      };

			init();
			animate();
      let scene, camera, renderer
			function init() {
				scene = ctx.scene;
				// scene.background = new THREE.Color( 0xf0f0f0 );

				camera = ctx.camera;
				camera.position.set( 0, 250, 1000 );
				scene.add( camera );

				scene.add( new THREE.AmbientLight( 0xf0f0f0 ) );
				const light = new THREE.SpotLight( 0xffffff, 1.5 );
				light.position.set( 0, 1500, 200 );
				light.angle = Math.PI * 0.2;
				light.castShadow = true;
				light.shadow.camera.near = 200;
				light.shadow.camera.far = 2000;
				light.shadow.bias = - 0.000222;
				light.shadow.mapSize.width = 1024;
				light.shadow.mapSize.height = 1024;
				scene.add( light );

				const planeGeometry = new THREE.PlaneBufferGeometry( 2000, 2000 );
				planeGeometry.rotateX( - Math.PI / 2 );
				const planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );

				const plane = new THREE.Mesh( planeGeometry, planeMaterial );
				plane.position.y = - 200;
				plane.receiveShadow = true;
				scene.add( plane );

				const helper = new THREE.GridHelper( 2000, 100 );
				helper.position.y = - 199;
				helper.material.opacity = 0.25;
				helper.material.transparent = true;
				scene.add( helper );

				renderer = ctx.renderer;
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.shadowMap.enabled = true;

        const getgui = () => new dat.GUI();
        if (window.gui) {
          window.gui.destroy()
        }
        let gui = getgui()
        window.gui = gui
        console.log(gui)
        // gui.add( params, 'uniform' );
				// gui.add( params, 'tension', 0, 1 ).step( 0.01 ).onChange( function ( value ) {
				// 	splines.uniform.tension = value;
				// 	updateSplineOutline();
        // } );
				// gui.add( params, 'centripetal' );
        // gui.add( params, 'chordal' );

				gui.add( params, 'addPoint' );
				gui.add( params, 'removePoint' );
				gui.add( params, 'exportSpline' );
				gui.open();

        // Controls
        let OrbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
        ctx.root.controls = new OrbitControls(ctx.root.camera, ctx.el)
				const controls = ctx.controls;
				controls.damping = 0.2;
				controls.addEventListener( 'change', render );

				transformControl = new TransformControls( camera, renderer.domElement );
				transformControl.addEventListener( 'change', render );
				transformControl.addEventListener( 'dragging-changed', function ( event ) {

					controls.enabled = ! event.value;

				} );
				scene.add( transformControl );

				transformControl.addEventListener( 'objectChange', function () {

					updateSplineOutline();

				} );

				document.addEventListener( 'pointerdown', onPointerDown, false );
				document.addEventListener( 'pointerup', onPointerUp, false );
				document.addEventListener( 'pointermove', onPointerMove, false );

				/*******
				 * Curves
				 *********/

				for ( let i = 0; i < splinePointsLength; i ++ ) {

					addSplineObject( positions[ i ] );

				}

				positions.length = 0;

				for ( let i = 0; i < splinePointsLength; i ++ ) {

					positions.push( splineHelperObjects[ i ].position );

				}

				const geometry = new THREE.BufferGeometry();
				geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ARC_SEGMENTS * 3 ), 3 ) );

				let curve = new THREE.CatmullRomCurve3( positions );
				curve.curveType = 'catmullrom';
				curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
					color: 0xff0000,
					opacity: 0.35
				} ) );
				curve.mesh.castShadow = true;
        splines.uniform = curve;

        //

				// curve = new THREE.CatmullRomCurve3( positions );
				// curve.curveType = 'centripetal';
				// curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
				// 	color: 0x00ff00,
				// 	opacity: 0.35
				// } ) );
				// curve.mesh.castShadow = true;
				// splines.centripetal = curve;

				// curve = new THREE.CatmullRomCurve3( positions );
				// curve.curveType = 'chordal';
				// curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
				// 	color: 0x0000ff,
				// 	opacity: 0.35
				// } ) );
				// curve.mesh.castShadow = true;
				// splines.chordal = curve;

				for ( const k in splines ) {

					const spline = splines[ k ];
					scene.add( spline.mesh );

				}

				// load( [ new THREE.Vector3( 289.76843686945404, 452.51481137238443, 56.10018915737797 ),
				// 	new THREE.Vector3( - 53.56300074753207, 171.49711742836848, - 14.495472686253045 ),
				// 	new THREE.Vector3( - 91.40118730204415, 176.4306956436485, - 6.958271935582161 ),
        // 	new THREE.Vector3( - 383.785318791128, 491.1365363371675, 47.869296953772746 ) ] );

        load(getArr());
			}

			function addSplineObject( position ) {

				const material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
				const object = new THREE.Mesh( geometry, material );

				if ( position ) {

					object.position.copy( position );

				} else {

					object.position.x = Math.random() * 1000 - 500;
					object.position.y = Math.random() * 600;
					object.position.z = Math.random() * 800 - 400;

				}

				object.castShadow = true;
				object.receiveShadow = true;
				scene.add( object );
				splineHelperObjects.push( object );
				return object;

			}

			function addPoint() {

				splinePointsLength ++;

				positions.push( addSplineObject().position );

				updateSplineOutline();

			}

			function removePoint() {

				if ( splinePointsLength <= 4 ) {

					return;

				}

				const point = splineHelperObjects.pop();
				splinePointsLength --;
				positions.pop();

				if ( transformControl.object === point ) transformControl.detach();
				scene.remove( point );

				updateSplineOutline();

			}

      let delay = 0
			function updateSplineOutline() {

				for ( const k in splines ) {

					const spline = splines[ k ];

					const splineMesh = spline.mesh;
					const position = splineMesh.geometry.attributes.position;

					for ( let i = 0; i < ARC_SEGMENTS; i ++ ) {

						const t = i / ( ARC_SEGMENTS - 1 );
						spline.getPoint( t, point );
						position.setXYZ( i, point.x, point.y, point.z );

					}

					position.needsUpdate = true;

        }

        clearTimeout(delay)
        delay = setTimeout(() => {
          setArr(positions)
        }, 10)

			}

			function exportSpline() {

				const strplace = [];

				for ( let i = 0; i < splinePointsLength; i ++ ) {

					const p = splineHelperObjects[ i ].position;
          strplace.push( `new THREE.Vector3(${p.x}, ${p.y}, ${p.z})` );
          // 'new THREE.Vector3({0}, {1}, {2})'.format( p.x, p.y, p.z )
				}

				console.log( strplace.join( ',\n' ) );
				const code = '[' + ( strplace.join( ',\n\t' ) ) + ']';
				prompt( 'copy and paste code', code );

			}

			function load( new_positions ) {

				while ( new_positions.length > positions.length ) {

					addPoint();

				}

				while ( new_positions.length < positions.length ) {

					removePoint();

				}

				for ( let i = 0; i < positions.length; i ++ ) {

					positions[ i ].copy( new_positions[ i ] );

				}

				updateSplineOutline();

			}

			function animate() {

				requestAnimationFrame( animate );
				render();
				// stats.update();

			}

			function render() {

				splines.uniform.mesh.visible = params.uniform;
				// splines.centripetal.mesh.visible = params.centripetal;
				// splines.chordal.mesh.visible = params.chordal;
				// renderer.render( scene, camera );

			}

			function onPointerDown( event ) {

				onDownPosition.x = event.clientX;
				onDownPosition.y = event.clientY;

			}

			function onPointerUp() {

				onUpPosition.x = event.clientX;
				onUpPosition.y = event.clientY;

				if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) transformControl.detach();

			}

			function onPointerMove( event ) {

				pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

				raycaster.setFromCamera( pointer, camera );

				const intersects = raycaster.intersectObjects( splineHelperObjects );

				if ( intersects.length > 0 ) {

					const object = intersects[ 0 ].object;

					if ( object !== transformControl.object ) {

						transformControl.attach( object );

					}

				}

			}
  }


}


export class LineGeo {
  constructor ({ count = 100, numSides = 8, subdivisions = 50, openEnded = false, dimension = 2 }) {
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
      });
    });

    // build typed arrays for our attributes
    const posArray = new Float32Array(xPositions);
    const angleArray = new Float32Array(angles);
    const uvArray = new Float32Array(uvs.length * 2);

    // unroll UVs
    for (let i = 0; i < posArray.length; i++) {
      const [ u, v ] = uvs[i];
      uvArray[i * 2 + 0] = u;
      uvArray[i * 2 + 1] = v;
    }

    const geometry = new THREE.InstancedBufferGeometry();
    geometry.instanceCount = count
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 1));
    geometry.setAttribute('angle', new THREE.BufferAttribute(angleArray, 1));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));

    let offsets = []

    if (dimension === 2) {
      // cube
      let ddxy = Math.ceil(Math.pow(count, 1 / 2)) - 1
      for (let y = 0; y <= ddxy; y ++ ) {
        for (let x = 0; x <= ddxy; x ++ ) {
          offsets.push(
            x / ddxy,
            0,
            y / ddxy
          )
        }
      }
    } else if (dimension === 3) {
      // cube
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
    }

    let reader = [];
    let ddxy = Math.ceil(Math.pow(count, 1 / 2)) - 1
    for (let y = 0; y <= ddxy; y ++ ) {
      for (let x = 0; x <= ddxy; x ++ ) {
        reader.push(
          x / ddxy,
          y / ddxy
        )
      }
    }

    geometry.setAttribute('reader', new THREE.InstancedBufferAttribute(new Float32Array(reader), 2));
    geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array( offsets ), 3));

    // dispose old geometry since we no longer need it
    baseGeometry.dispose();
    return geometry;
  }
}


/*

n−1, n, n+1 and n+2

vec3 pointIDX (float index) {
  vec3 result = vec3(0.0);
  for(int i=0; i  <10; ++i) {
    float i_float = float(i);
    if (i_float == index) {
      result = controlPoints[i];
    }
  }
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
  float ll = UNIFROM_CONTROL_POINTS_LENGTH;
  float minusOne = 1.0;
  if (closed) {
    minusOne = 0.0;
  }

  float p = (ll - minusOne) * t;
  float intPoint = floor(p);
  float weight = p - intPoint;

  float idx0 = intPoint - 1.0;
  float idx1 = intPoint;
  float idx2 = intPoint + 1.0;
  float idx3 = intPoint + 2.0;

  vec3 pt0 = pointIDX(idx0);
  vec3 pt1 = pointIDX(idx1);
  vec3 pt2 = pointIDX(idx2);
  vec3 pt3 = pointIDX(idx3);

  vec3 pointoutput = catmullRom(pt0, pt1, pt2, pt3, weight);

  return pointoutput;
}



vec3 CatmullRom ( float u, vec3 x0, vec3 x1, vec3 x2, vec3 x3 ) {
    float u2 = u * u;
    float u3 = u2 * u;
    return ((2 * x1) +
           (-x0 + x2) * u +
           (2*x0 - 5*x1 + 4*x2 - x3) * u2 +
           (-x0 + 3*x1 - 3*x2 + x3) * u3) * 0.5f;
}

// ---------------------

function catmullrom(a, b, c, d) {
  const p = -0.5 * a + 1.5 * b - 1.5 * c + 0.5 * d,
        q =        a - 2.5 * b + 2.0 * c - 0.5 * d,
        r = -0.5 * a           + 0.5 * c          ,
        s =                  b                    ;

  return x => ((p * x + q) * x + r) * x + s;
}

vec4 makeOneControl (a, b, c, d) {
  float p = -0.5 * a + 1.5 * b - 1.5 * c + 0.5 * d;
  float q =        a - 2.5 * b + 2.0 * c - 0.5 * d;
  float r = -0.5 * a           + 0.5 * c          ;
  float s =                  b                    ;

  return vec4(p, q, r, s);
}

vec3 plotCurve (float t, vec4 controlX, vec4 controlY, vec4 controlZ) {
  float x = ((controlX.r * t + controlX.g) * t + controlX.b) * t + controlX.a;
  float y = ((controlY.r * t + controlY.g) * t + controlY.b) * t + controlY.a;
  float z = ((controlZ.r * t + controlZ.g) * t + controlZ.b) * t + controlZ.a;

  return vec3(x, y, z);
}

vec3 makeXYZControlThenPlot (float weight, vec3 pt1, vec3 pt2, vec3 pt3, vec3 pt4) {
  vec4 controlX = makeOneControl(pt1.x, pt2.x, pt3.x, pt4.x);
  vec4 controlY = makeOneControl(pt1.y, pt2.y, pt3.y, pt4.y);
  vec4 controlZ = makeOneControl(pt1.z, pt2.z, pt3.z, pt4.z);

  return plotCurve(weight, controlX, controlY, controlZ);
}

float CatmullRom ( float u, float x0, float x1, float x2, float x3 ) {
    float u2 = u * u;
    float u3 = u2 * u;
    return ((2 * x1) +
           (-x0 + x2) * u +
           (2*x0 - 5*x1 + 4*x2 - x3) * u2 +
           (-x0 + 3*x1 - 3*x2 + x3) * u3) * 0.5f;
}



// ---------------------

float bezierCurve(float t, float p0, float p1, float p2, float p3)
{
    float t2 = t * t;
    float t3 = t2 * t;
    return p0
        +  3*(p1 - p0) * t
        +  3*(p2 - 2*p1 + p0) * t2
        +  (p3 - 3*(p2 - p1) - p0) * t3;
}

// ---------------------

// Coefficients for Matrix M
#define M11	 0.0
#define M12	 1.0
#define M13	 0.0
#define M14	 0.0
#define M21	-0.5
#define M22	 0.0
#define M23	 0.5
#define M24	 0.0
#define M31	 1.0
#define M32	-2.5
#define M33	 2.0
#define M34	-0.5
#define M41	-0.5
#define M42	 1.5
#define M43	-1.5
#define M44	 0.5

double catmullRomSpline(float x, float v0,float v1,
				float v2,float v3) {

	double c1,c2,c3,c4;

	c1 =  	      M12*v1;
	c2 = M21*v0          + M23*v2;
	c3 = M31*v0 + M32*v1 + M33*v2 + M34*v3;
	c4 = M41*v0 + M42*v1 + M43*v2 + M44*v3;

	return(((c4*x + c3)*x +c2)*x + c1);
}


// ---------------------


struct point
{
	float x;
	float y;
	float z;
};


struct point CatmullRoll(float t, struct point p1, struct point p2, struct point p3, struct point p4)
{

	float t2 = t*t;
	float t3 = t*t*t;
	struct point v; // Interpolated point

	// Catmull Rom spline Calculation

	v.x = ((-t3 + 2*t2-t)*(p1.x) + (3*t3-5*t2+2)*(p2.x) + (-3*t3+4*t2+t)* (p3.x) + (t3-t2)*(p4.x))/2;
	v.y = ((-t3 + 2*t2-t)*(p1.y) + (3*t3-5*t2+2)*(p2.y) + (-3*t3+4*t2+t)* (p3.y) + (t3-t2)*(p4.y))/2;

	return v;
}


// ---------------------


*/


