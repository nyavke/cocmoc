import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { buildCrystal, crystalMat } from '../utils/crystal'

export default function CrystalPreview({ scaleY, seed, colA, colB, colC }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const w = mount.clientWidth || 400
    const h = mount.clientHeight || 400

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.6
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 100)
    camera.position.set(0, 0, 10)

    const geo = buildCrystal(scaleY, seed)
    const mat = crystalMat(colA, colB, colC, 0.35)
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    const eGeo = new THREE.EdgesGeometry(geo, 5)
    const eMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(...colB).multiplyScalar(5),
      transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    const edgeMesh = new THREE.LineSegments(eGeo, eMat)
    scene.add(edgeMesh)

    scene.add(new THREE.AmbientLight(0x080010, 1.2))
    const pl = new THREE.PointLight(new THREE.Color(...colB), 1.8, 18)
    pl.position.set(2, 3, 4)
    scene.add(pl)
    const pl2 = new THREE.PointLight(new THREE.Color(...colC), 0.7, 14)
    pl2.position.set(-3, -2, 3)
    scene.add(pl2)

    const clock = new THREE.Clock()
    let raf
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      mesh.rotation.x = t * 0.5
      mesh.rotation.y = t * 0.12
      edgeMesh.rotation.copy(mesh.rotation)
      mat.uniforms.time.value = t
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
      mat.dispose()
      geo.dispose()
      eGeo.dispose()
      eMat.dispose()
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
