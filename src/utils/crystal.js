import * as THREE from 'three'

function seededRng(seed) {
  let s = seed | 0
  return () => { s=(s^(s<<13))>>>0; s=(s^(s>>7))>>>0; s=(s^(s<<17))>>>0; return s/4294967296 }
}

export function buildCrystal(scaleY, seed) {
  const geo = new THREE.IcosahedronGeometry(1.4, 0).toNonIndexed()
  const pos = geo.attributes.position
  const r = seededRng(seed)
  const map = new Map()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const key = `${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`
    if (!map.has(key)) map.set(key, (r() - 0.5) * 0.5)
    const d = map.get(key), len = Math.sqrt(x*x+y*y+z*z) || 1
    pos.setXYZ(i, x+x/len*d, y+y/len*d, z+z/len*d)
  }
  for (let i = 0; i < pos.count; i++) pos.setY(i, pos.getY(i) * scaleY)
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

export function crystalMat(colA, colB, colC, baseBoost = 0.0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      time:      { value: 0 },
      colA:      { value: new THREE.Color(...colA) },
      colB:      { value: new THREE.Color(...colB) },
      colC:      { value: new THREE.Color(...colC) },
      lightDir:  { value: new THREE.Vector3(1,2,3).normalize() },
      baseBoost: { value: baseBoost },
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vV; varying vec3 vWP;
      void main(){
        vec4 wp=modelMatrix*vec4(position,1.0); vWP=wp.xyz;
        vN=normalize(normalMatrix*normal); vV=normalize(cameraPosition-wp.xyz);
        gl_Position=projectionMatrix*viewMatrix*wp;
      }`,
    fragmentShader: `
      uniform float time,baseBoost; uniform vec3 colA,colB,colC,lightDir;
      varying vec3 vN,vV,vWP;
      void main(){
        vec3 N=normalize(vN); vec3 V=normalize(vV);
        float fresnel=pow(1.0-max(dot(N,V),0.0),2.8);
        float diff=max(dot(N,lightDir),0.0);
        vec3 base=colA*(0.05+baseBoost+diff*0.15);
        float shift=dot(N,vec3(sin(time*0.07),cos(time*0.05),0.5))*0.5+0.5;
        vec3 irid=mix(colA,colB,shift);
        irid=mix(irid,colC,pow(fresnel,1.5)*0.6);
        irid+=sin(shift*6.28+time*0.15)*colB*0.25;
        vec3 col=base+irid*(fresnel*2.2);
        col+=colB*pow(fresnel,4.5)*2.8;
        col+=colC*pow(fresnel,7.0)*4.5;
        gl_FragColor=vec4(col,1.0);
      }`,
  })
}
