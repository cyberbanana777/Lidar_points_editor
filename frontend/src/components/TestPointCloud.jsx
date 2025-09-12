import { useRef } from 'react'
import * as THREE from 'three'

export default function TestPointCloud() {
  // Создаем тестовые данные - 5 точек в форме креста
  const vertices = new Float32Array([
     0,  0,  0,  // центр
     5,  0,  0,  // право
    -5,  0,  0,  // лево
     0,  5,  0,  // верх
     0, -5,  0   // низ
  ])
  
  const colors = new Float32Array([
    1, 0, 0,  // красный - центр
    0, 1, 0,  // зеленый - право  
    0, 0, 1,  // синий - лево
    1, 1, 0,  // желтый - верх
    1, 0, 1   // magenta - низ
  ])

  // Создаем геометрию и материал
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.computeBoundingSphere()

  const material = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    sizeAttenuation: true
  })

  // Создаем points object
  const points = new THREE.Points(geometry, material)

  return <primitive object={points} />
}