import * as THREE from 'three'

const PLANET_DATA = [
  {
    name: 'Mercury',
    pos: [-7, 2, -15], radius: 0.55,
    colA: [0.38, 0.32, 0.28], colB: [0.55, 0.48, 0.42], colC: [0.65, 0.60, 0.55],
    atmCol: [0.6, 0.5, 0.4], atmStr: 0.3, bands: 4, rings: false, rotSpeed: 0.006,
  },
  {
    name: 'Venus',
    pos: [10, -1.5, -42], radius: 0.95,
    colA: [0.82, 0.65, 0.18], colB: [0.95, 0.80, 0.40], colC: [1.0, 0.90, 0.62],
    atmCol: [1.0, 0.72, 0.15], atmStr: 2.2, bands: 6, rings: false, rotSpeed: 0.004,
  },
  {
    name: 'Earth',
    pos: [-12, 4.5, -26], radius: 1.0,
    colA: [0.05, 0.18, 0.72], colB: [0.08, 0.52, 0.18], colC: [0.82, 0.92, 1.0],
    atmCol: [0.25, 0.58, 1.0], atmStr: 1.8, bands: 5, rings: false, rotSpeed: 0.010,
  },
  {
    name: 'Mars',
    pos: [8, -2.5, -78], radius: 0.65,
    colA: [0.68, 0.18, 0.04], colB: [0.88, 0.42, 0.14], colC: [0.95, 0.65, 0.35],
    atmCol: [1.0, 0.35, 0.08], atmStr: 0.5, bands: 5, rings: false, rotSpeed: 0.009,
  },
  {
    name: 'Jupiter',
    pos: [-20, 10, -58], radius: 5.8,
    colA: [0.72, 0.50, 0.30], colB: [0.90, 0.70, 0.48], colC: [0.98, 0.85, 0.60],
    atmCol: [1.0, 0.72, 0.35], atmStr: 0.8, bands: 14, rings: false, rotSpeed: 0.018,
  },
  {
    name: 'Saturn',
    pos: [18, -5.5, -105], radius: 3.4,
    colA: [0.82, 0.72, 0.38], colB: [0.94, 0.85, 0.55], colC: [0.98, 0.92, 0.72],
    atmCol: [1.0, 0.88, 0.45], atmStr: 0.7, bands: 10, rings: true, rotSpeed: 0.015,
  },
  {
    name: 'Uranus',
    pos: [-9.5, 8.5, -138], radius: 2.1,
    colA: [0.35, 0.78, 0.88], colB: [0.50, 0.90, 0.95], colC: [0.75, 0.95, 1.0],
    atmCol: [0.38, 0.85, 1.0], atmStr: 1.6, bands: 3, rings: false, rotSpeed: 0.007,
  },
  {
    name: 'Neptune',
    pos: [8.5, -4, -154], radius: 1.8,
    colA: [0.08, 0.12, 0.82], colB: [0.12, 0.28, 1.0], colC: [0.25, 0.55, 1.0],
    atmCol: [0.15, 0.38, 1.0], atmStr: 2.0, bands: 5, rings: false, rotSpeed: 0.008,
  },
]

function surfaceMat({ colA, colB, colC, atmCol, atmStr, bands }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      time:   { value: 0 },
      colA:   { value: new THREE.Color(...colA) },
      colB:   { value: new THREE.Color(...colB) },
      colC:   { value: new THREE.Color(...colC) },
      atmCol: { value: new THREE.Color(...atmCol) },
      atmStr: { value: atmStr },
      bands:  { value: bands },
      sunDir: { value: new THREE.Vector3(1.5, 1.0, 2.0).normalize() },
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main(){
        vec4 wp=modelMatrix*vec4(position,1.0);
        vN=normalize(normalMatrix*normal);
        vV=normalize(cameraPosition-wp.xyz);
        gl_Position=projectionMatrix*viewMatrix*wp;
      }`,
    fragmentShader: `
      uniform float time,atmStr,bands;
      uniform vec3 colA,colB,colC,atmCol,sunDir;
      varying vec3 vN,vV;
      void main(){
        vec3 N=normalize(vN); vec3 V=normalize(vV);
        float lat=N.y;
        float b1=sin(lat*bands*3.14159+time*0.015)*0.5+0.5;
        float b2=sin(lat*bands*2.1+time*0.009+1.3)*0.5+0.5;
        float b3=sin(lat*bands*0.65-time*0.011)*0.5+0.5;
        vec3 surf=mix(colA,colB,b1);
        surf=mix(surf,colC,b2*0.35);
        surf+=(b3-0.5)*colC*0.12;
        float diff=max(dot(N,sunDir),0.0)*0.75+0.18;
        surf*=diff;
        float fresnel=pow(1.0-max(dot(N,V),0.0),3.0);
        surf+=atmCol*fresnel*atmStr;
        gl_FragColor=vec4(surf,1.0);
      }`,
  })
}

function atmosphereMat(atmCol, atmStr) {
  return new THREE.ShaderMaterial({
    uniforms: {
      atmCol: { value: new THREE.Color(...atmCol) },
      atmStr: { value: Math.min(atmStr, 2.5) },
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main(){
        vec4 wp=modelMatrix*vec4(position,1.0);
        vN=normalize(normalMatrix*normal);
        vV=normalize(cameraPosition-wp.xyz);
        gl_Position=projectionMatrix*viewMatrix*wp;
      }`,
    fragmentShader: `
      uniform vec3 atmCol; uniform float atmStr;
      varying vec3 vN,vV;
      void main(){
        float NV=max(dot(normalize(vN),normalize(vV)),0.0);
        float rim=pow(1.0-NV,2.2);
        gl_FragColor=vec4(atmCol*atmStr*0.7,rim*0.88);
      }`,
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
}

function buildRings(radius, colB) {
  const inner = radius * 1.35, outer = radius * 2.5
  const segs = 180
  const pos = [], uv = [], idx = []
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2
    const c = Math.cos(a), s = Math.sin(a)
    pos.push(c * inner, 0, s * inner, c * outer, 0, s * outer)
    uv.push(0, i / segs, 1, i / segs)
    if (i < segs) { const b = i * 2; idx.push(b,b+1,b+2, b+1,b+3,b+2) }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geo.setIndex(idx)
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      col:  { value: new THREE.Color(...colB) },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      uniform float time; uniform vec3 col;
      varying vec2 vUv;
      void main(){
        float r=vUv.x;
        float b1=sin(r*22.0+time*0.008)*0.5+0.5;
        float b2=sin(r*44.0-time*0.006)*0.4+0.6;
        float b3=sin(r*8.0+time*0.004)*0.3+0.7;
        float edge=smoothstep(0.0,0.06,r)*smoothstep(1.0,0.94,r);
        float alpha=edge*b2*b3*0.75;
        gl_FragColor=vec4(col*(0.6+b1*0.5),alpha);
      }`,
    transparent: true, depthWrite: false,
    side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.rotation.x = Math.PI * 0.42
  return { mesh, mat }
}

export function addPlanets(scene) {
  const animatables = []

  PLANET_DATA.forEach(p => {
    const group = new THREE.Group()
    group.position.set(...p.pos)
    scene.add(group)

    // Surface sphere
    const geo = new THREE.SphereGeometry(p.radius, 64, 64)
    const mat = surfaceMat(p)
    const mesh = new THREE.Mesh(geo, mat)
    group.add(mesh)

    // Atmosphere
    const atmGeo = new THREE.SphereGeometry(p.radius * 1.14, 32, 32)
    const atmMat = atmosphereMat(p.atmCol, p.atmStr)
    group.add(new THREE.Mesh(atmGeo, atmMat))

    // Subtle point light contribution
    const pl = new THREE.PointLight(new THREE.Color(...p.atmCol), 0.25, p.radius * 10)
    group.add(pl)

    let ringMat = null
    if (p.rings) {
      const r = buildRings(p.radius, p.colB)
      group.add(r.mesh)
      ringMat = r.mat
    }

    animatables.push({ mat, ringMat, mesh, rotSpeed: p.rotSpeed })
  })

  return animatables
}

export function animatePlanets(animatables, t) {
  animatables.forEach(({ mat, ringMat, mesh, rotSpeed }) => {
    mesh.rotation.y = t * rotSpeed
    mat.uniforms.time.value = t
    if (ringMat) ringMat.uniforms.time.value = t
  })
}
