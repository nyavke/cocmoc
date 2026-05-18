import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import Overlay from './Overlay'
import ContactScreen from './ContactScreen'
import CrystalModal from './CrystalModal'
import { playChime, playEnter, playBlackHole } from '../utils/audio'
import { buildCrystal, crystalMat } from '../utils/crystal'

// ── CRYSTAL STATIONS ─────────────────────────────────────────────────────────
const STATIONS = [
  {
    label: 'COCMOC.RU',
    sub: 'Creating the next onchain civilization',
    tag: 'EST. 2024',
    pos: [0, 0, 0],
    colA: [0.18, 0.05, 0.70], colB: [0.55, 0.20, 1.00], colC: [0.85, 0.65, 1.00],
    scaleY: 2.3, seed: 7,
  },
  {
    label: 'NOVA PROTOCOL',
    sub: 'Decentralized infrastructure · 10,000 nodes',
    tag: 'INFRASTRUCTURE',
    pos: [2.5, -0.5, -32],
    colA: [0.00, 0.20, 0.90], colB: [0.00, 0.65, 1.00], colC: [0.40, 0.90, 1.00],
    scaleY: 2.0, seed: 13,
  },
  {
    label: 'STELLAR MARKET',
    sub: 'Onchain economy without borders · $2.4B',
    tag: 'ECONOMY',
    pos: [-2.5, 0.5, -64],
    colA: [0.70, 0.30, 0.00], colB: [1.00, 0.60, 0.10], colC: [1.00, 0.85, 0.40],
    scaleY: 1.9, seed: 42,
  },
  {
    label: 'VOID IDENTITY',
    sub: 'Self-sovereign identity · 2.1M citizens',
    tag: 'IDENTITY',
    pos: [3.0, -1.0, -96],
    colA: [0.50, 0.00, 0.50], colB: [0.90, 0.00, 0.75], colC: [1.00, 0.50, 0.90],
    scaleY: 2.5, seed: 99,
  },
  {
    label: 'NEBULA GRID',
    sub: 'Distributed stellar compute · 840 PFLOPS',
    tag: 'COMPUTE',
    pos: [-2.0, 1.0, -128],
    colA: [0.00, 0.50, 0.35], colB: [0.00, 0.85, 0.55], colC: [0.35, 1.00, 0.70],
    scaleY: 2.1, seed: 23,
  },
]

const BH_POS = [0, 0, -162]
const CRYSTAL_THRESH = 0.78  // 0-78% = crystal journey
const BH_THRESH = 0.92       // 78-92% = black hole approach, 92%+ = contact

// ── POST-PROCESSING SHADERS ───────────────────────────────────────────────────
const ChromaShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0.003 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float amount; varying vec2 vUv;
    void main(){
      vec2 c=vec2(0.5); vec2 d=vUv-c; float e=length(d);
      float r=texture2D(tDiffuse,vUv+d*amount*e).r;
      float g=texture2D(tDiffuse,vUv).g;
      float b=texture2D(tDiffuse,vUv-d*amount*e).b;
      gl_FragColor=vec4(r,g,b,1.0);
    }`,
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
// buildCrystal and crystalMat imported from ../utils/crystal

// ── ACCRETION DISK GEOMETRY ───────────────────────────────────────────────────
function buildAccretionDisk(innerR=2.0, outerR=7.0, segs=256, rings=32) {
  const pos=[], uvs=[], idx=[]
  for (let r=0; r<=rings; r++) {
    const t=r/rings, rad=innerR+(outerR-innerR)*t
    for (let s=0; s<=segs; s++) {
      const a=(s/segs)*Math.PI*2
      pos.push(Math.cos(a)*rad, 0, Math.sin(a)*rad)
      uvs.push(t, s/segs)
    }
  }
  for (let r=0; r<rings; r++)
    for (let s=0; s<segs; s++) {
      const a=r*(segs+1)+s, b=a+1, c=a+segs+1, d=c+1
      idx.push(a,b,c, b,d,c)
    }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs,2))
  geo.setIndex(idx)
  return geo
}

// ── JET GEOMETRY ─────────────────────────────────────────────────────────────
function buildJet(dir=1, count=800) {
  const pos=new Float32Array(count*3), spd=new Float32Array(count), ph=new Float32Array(count)
  for (let i=0; i<count; i++) {
    const r=Math.random()*0.25, a=Math.random()*Math.PI*2
    pos[i*3]=Math.cos(a)*r; pos[i*3+1]=dir*0.5; pos[i*3+2]=Math.sin(a)*r
    spd[i]=0.25+Math.random()*0.4; ph[i]=Math.random()
  }
  const geo=new THREE.BufferGeometry()
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3))
  geo.setAttribute('speed',new THREE.BufferAttribute(spd,1))
  geo.setAttribute('phase',new THREE.BufferAttribute(ph,1))
  return geo
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function CosmosScene({ entered = false }) {
  const mountRef = useRef(null)
  const enteredRef = useRef(entered)
  useEffect(() => { enteredRef.current = entered }, [entered])
  const [stationIdx, setStationIdx] = useState(0)
  const [subProgress, setSubProgress] = useState(0)
  const [inBlackHole, setInBlackHole] = useState(false)
  const [activeCrystal, setActiveCrystal] = useState(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.4
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(58, window.innerWidth/window.innerHeight, 0.1, 800)
    camera.position.set(0, 0, 20)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.1, 0.5, 0.45)
    composer.addPass(bloom)
    const chroma = new ShaderPass(ChromaShader)
    composer.addPass(chroma)

    // ── STARS ────────────────────────────────────────────────────────────────
    const sGeo = new THREE.BufferGeometry()
    const sPos=new Float32Array(5000*3), sCol=new Float32Array(5000*3)
    const pal=[[0.85,0.82,1],[0.6,0.5,1],[0.95,0.85,0.55],[0.5,0.7,1],[1,0.75,0.9]]
    for (let i=0; i<5000; i++) {
      const θ=Math.random()*Math.PI*2, φ=Math.acos(2*Math.random()-1), rad=80+Math.random()*300
      sPos[i*3]=rad*Math.sin(φ)*Math.cos(θ); sPos[i*3+1]=rad*Math.sin(φ)*Math.sin(θ); sPos[i*3+2]=rad*Math.cos(φ)-80
      const c=pal[Math.floor(Math.random()*pal.length)]
      sCol[i*3]=c[0]; sCol[i*3+1]=c[1]; sCol[i*3+2]=c[2]
    }
    sGeo.setAttribute('position',new THREE.BufferAttribute(sPos,3))
    sGeo.setAttribute('color',new THREE.BufferAttribute(sCol,3))
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
      size:0.18, vertexColors:true, transparent:true, opacity:0.7,
      blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true,
    })))

    // ── NEBULA DUST ──────────────────────────────────────────────────────────
    const dGeo=new THREE.BufferGeometry()
    const dPos=new Float32Array(4000*3)
    for (let i=0; i<4000; i++) {
      dPos[i*3]=(Math.random()-.5)*30; dPos[i*3+1]=(Math.random()-.5)*20; dPos[i*3+2]=-Math.random()*175
    }
    dGeo.setAttribute('position',new THREE.BufferAttribute(dPos,3))
    scene.add(new THREE.Points(dGeo, new THREE.PointsMaterial({
      size:0.06, color:0x3312aa, transparent:true, opacity:0.35,
      blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true,
    })))

    // ── CRYSTALS ─────────────────────────────────────────────────────────────
    const mats=[], crystals=[], edges=[]
    STATIONS.forEach(({ pos, colA, colB, colC, scaleY, seed }) => {
      const geo=buildCrystal(scaleY, seed)
      const mat=crystalMat(colA, colB, colC); mats.push(mat)
      const mesh=new THREE.Mesh(geo, mat)
      mesh.position.set(...pos); mesh.rotation.set(0.15, Math.random()*Math.PI, 0.08)
      scene.add(mesh); crystals.push(mesh)
      const eGeo=new THREE.EdgesGeometry(geo, 5)
      const eMat=new THREE.LineBasicMaterial({ color:new THREE.Color(...colB).multiplyScalar(0.9), transparent:true, opacity:0.7, blending:THREE.AdditiveBlending, depthWrite:false })
      const e=new THREE.LineSegments(eGeo, eMat)
      e.position.set(...pos); e.rotation.copy(mesh.rotation)
      scene.add(e); edges.push(e)
    })

    // ── BLACK HOLE ───────────────────────────────────────────────────────────
    const bhGroup = new THREE.Group()
    bhGroup.position.set(...BH_POS)
    scene.add(bhGroup)

    // Singularity: pure black sphere with thin bright white rim
    const singMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec3 vN, vV;
        void main(){
          vec4 wp=modelMatrix*vec4(position,1.0);
          vN=normalize(normalMatrix*normal);
          vV=normalize(cameraPosition-wp.xyz);
          gl_Position=projectionMatrix*viewMatrix*wp;
        }`,
      fragmentShader: `
        uniform float time; varying vec3 vN, vV;
        void main(){
          vec3 N=normalize(vN); vec3 V=normalize(vV);
          float NV=max(dot(N,V),0.0);
          float rim=1.0-NV;
          // Thin ring: peak brightness at the very edge, falls off fast inward
          float edge=pow(rim,5.5);
          // Subtle pulsing white-blue outline
          float pulse=0.92+0.08*sin(time*0.6);
          vec3 col=vec3(0.0); // pure black core
          col+=edge*vec3(2.8,2.9,3.5)*pulse; // bright white-blue rim → blooms
          gl_FragColor=vec4(col,1.0);
        }`,
    })
    bhGroup.add(new THREE.Mesh(new THREE.SphereGeometry(2.2, 64, 64), singMat))

    // Photon ring — single bright thin torus at event horizon
    const photonRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.28, 0.055, 16, 320),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(3.5, 3.5, 4.2),
        blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
      })
    )
    photonRing.rotation.x = Math.PI * 0.5
    bhGroup.add(photonRing)

    // Soft outer halo (backside sphere, additive, very dim)
    bhGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 32, 32),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.08, 0.04, 0.22),
        blending: THREE.AdditiveBlending, transparent: true,
        opacity: 0.18, depthWrite: false, side: THREE.BackSide,
      })
    ))

    // ── SCENE LIGHTS ────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x080010, 1))

    // ── STATE ────────────────────────────────────────────────────────────────
    const state = {
      scrollY:0, camZ:20, camX:0, camY:0, mouseX:0, mouseY:0, tX:0, tY:0,
      dragYaw:0, dragPitch:0,         // smoothed current
      dragYawT:0, dragPitchT:0,       // targets (reset to 0 on release)
      isDragging:false, hasDragged:false, lastDragX:0, lastDragY:0,
    }
    const mouseNDC = { x: 0, y: 0 }
    const raycaster = new THREE.Raycaster()
    const prevStation = { value: -1 }
    const prevInBH = { value: false }

    const onScroll = () => { if (enteredRef.current) state.scrollY = window.scrollY }
    const onMouse = (e) => {
      state.tX = (e.clientX/window.innerWidth - 0.5) * 2
      state.tY = -(e.clientY/window.innerHeight - 0.5) * 2
      if (state.isDragging) {
        const dx = e.clientX - state.lastDragX
        const dy = e.clientY - state.lastDragY
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) state.hasDragged = true
        state.dragYawT   = Math.max(-0.55, Math.min(0.55, state.dragYawT   - dx * 0.003))
        state.dragPitchT = Math.max(-0.30, Math.min(0.30, state.dragPitchT - dy * 0.003))
        state.lastDragX  = e.clientX
        state.lastDragY  = e.clientY
      } else {
        mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1
        mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1
        raycaster.setFromCamera(mouseNDC, camera)
        const hits = raycaster.intersectObjects(crystals)
        renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab'
      }
    }
    const onMouseDown = (e) => {
      if (e.button !== 0) return
      state.isDragging = true
      state.hasDragged = false
      state.lastDragX  = e.clientX
      state.lastDragY  = e.clientY
      renderer.domElement.style.cursor = 'grabbing'
    }
    const onMouseUp = () => {
      state.isDragging = false
      state.dragYawT   = 0  // spring back to center
      state.dragPitchT = 0
      renderer.domElement.style.cursor = 'grab'
    }
    const onClick = (e) => {
      if (state.hasDragged) return
      mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouseNDC, camera)
      const hits = raycaster.intersectObjects(crystals)
      if (hits.length > 0) {
        const idx = crystals.indexOf(hits[0].object)
        if (idx !== -1) {
          setActiveCrystal(idx)
          playEnter(idx)
        }
      }
    }
    renderer.domElement.style.cursor = 'grab'
    window.addEventListener('scroll', onScroll, { passive:true })
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('mouseup', onMouseUp)
    renderer.domElement.addEventListener('mousedown', onMouseDown)
    renderer.domElement.addEventListener('click', onClick)

    const onResize = () => {
      camera.aspect = window.innerWidth/window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      composer.setSize(window.innerWidth, window.innerHeight)
      bloom.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    let raf
    const clock = new THREE.Clock()
    const tmpV = new THREE.Vector3()
    const _camPos = new THREE.Vector3()
    const _lookDir = new THREE.Vector3()
    const _qYaw = new THREE.Quaternion()
    const _qPitch = new THREE.Quaternion()
    const _yawAxis = new THREE.Vector3(0, 1, 0)
    const _pitchAxis = new THREE.Vector3(1, 0, 0)

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Scroll fraction
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight
      const sf = Math.min(state.scrollY / Math.max(scrollMax,1), 1)

      // Mouse smooth
      state.mouseX += (state.tX - state.mouseX) * 0.05
      state.mouseY += (state.tY - state.mouseY) * 0.05

      let targetZ = 6
      let si = 0, sp = 0
      const N = STATIONS.length // 5

      if (sf <= CRYSTAL_THRESH) {
        const cf = sf / CRYSTAL_THRESH                        // 0→1
        const stF = cf * (N - 1)                             // 0→4
        si = Math.min(Math.floor(stF), N - 2)
        sp = stF - si
        const ease = sp*sp*(3-2*sp)
        targetZ = THREE.MathUtils.lerp(6 - si*32, 6 - (si+1)*32, ease)
        setStationIdx(si)
        setSubProgress(sp)
      } else if (sf <= BH_THRESH) {
        const bhF = (sf - CRYSTAL_THRESH) / (BH_THRESH - CRYSTAL_THRESH)
        targetZ = THREE.MathUtils.lerp(-122, -156, bhF*bhF)
        si = N - 1; sp = bhF
        setStationIdx(5) // black hole station
        setSubProgress(bhF)
      } else {
        targetZ = -156
        setStationIdx(5)
        setSubProgress(1)
      }

      const inBH = sf > BH_THRESH
      setInBlackHole(inBH)

      // Chime on station change
      if (si !== prevStation.value) {
        prevStation.value = si
        if (sf <= CRYSTAL_THRESH) playChime(si)
      }

      // Black hole entry whoosh — fires when actually crossing the event horizon
      if (inBH && !prevInBH.value) playBlackHole()
      prevInBH.value = inBH

      // Camera lerp
      state.camZ += (targetZ - state.camZ) * 0.06

      // Look target — interpolate between current and next station so last crystal aligns correctly
      let lookX, lookY, lookZ
      if (si < N) {
        const ease = sp*sp*(3-2*sp)
        const cst0 = STATIONS[si]
        const cst1 = STATIONS[Math.min(si + 1, N - 1)]
        lookX = THREE.MathUtils.lerp(cst0.pos[0], cst1.pos[0], ease) * 0.3 + state.mouseX * 0.4
        lookY = THREE.MathUtils.lerp(cst0.pos[1], cst1.pos[1], ease) * 0.2 + state.mouseY * 0.25
        lookZ = THREE.MathUtils.lerp(cst0.pos[2], cst1.pos[2], ease)
      } else {
        lookX = state.mouseX * 0.2; lookY = state.mouseY * 0.15; lookZ = BH_POS[2]
      }
      state.camX += (lookX - state.camX) * 0.04
      state.camY += (lookY - state.camY) * 0.04

      // Smooth drag: follow target while dragging, spring back to 0 on release
      const dragLerp = state.isDragging ? 0.12 : 0.06
      state.dragYaw   += (state.dragYawT   - state.dragYaw)   * dragLerp
      state.dragPitch += (state.dragPitchT - state.dragPitch) * dragLerp

      _camPos.set(state.camX * 0.25, state.camY * 0.18, state.camZ)
      camera.position.copy(_camPos)
      _lookDir.set(
        state.camX*0.2 + state.mouseX*0.1 - _camPos.x,
        state.camY*0.15 + state.mouseY*0.08 - _camPos.y,
        -20,
      ).normalize()
      _qYaw.setFromAxisAngle(_yawAxis, state.dragYaw)
      _qPitch.setFromAxisAngle(_pitchAxis, state.dragPitch)
      _lookDir.applyQuaternion(_qYaw).applyQuaternion(_qPitch)
      tmpV.copy(_camPos).addScaledVector(_lookDir, 20)
      camera.lookAt(tmpV)

      // Crystal animation
      crystals.forEach((m, i) => {
        m.rotation.y = t * 0.05 + i * 1.1
        m.rotation.x = 0.15 + Math.sin(t*0.03+i)*0.04
        edges[i].rotation.copy(m.rotation)
      })
      mats.forEach(m => { m.uniforms.time.value = t })

      // Black hole animation
      singMat.uniforms.time.value = t
      photonRing.rotation.z = t * 0.08

      // Chromatic aberration: very slight pulse
      chroma.uniforms.amount.value = 0.003 + Math.sin(t * 0.4) * 0.0008

      composer.render()
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      renderer.domElement.removeEventListener('click', onClick)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <>
      <div ref={mountRef} style={{ position:'fixed', inset:0, zIndex:0 }} />
      {entered && <Overlay stationIdx={stationIdx} subProgress={subProgress} inBlackHole={inBlackHole} />}
      {entered && <ContactScreen visible={inBlackHole} />}
      {entered && activeCrystal !== null && (
        <CrystalModal idx={activeCrystal} onClose={() => setActiveCrystal(null)} />
      )}
    </>
  )
}
