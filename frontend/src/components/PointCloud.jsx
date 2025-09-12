import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PointCloud({ data, onLoad, onError }) {
  const pointsRef = useRef()
  const [points, setPoints] = useState(null)

  useEffect(() => {
    if (!data) return

    try {
      console.log('Creating point cloud from data:', data)
      
      // Создаем геометрию и материал правильно
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(data.points, 3))
      
      if (data.colors && data.colors.length > 0) {
        geometry.setAttribute('color', new THREE.BufferAttribute(data.colors, 3))
      }
      
      geometry.computeBoundingSphere()
      
      const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        sizeAttenuation: true,
      })

      // Создаем points object правильно
      const pointsObject = new THREE.Points(geometry, material)
      setPoints(pointsObject)
      
      if (onLoad) {
        onLoad()
      }
      
    } catch (error) {
      console.error('Error creating point cloud:', error)
      if (onError) {
        onError(error.message)
      }
    }
  }, [data, onLoad, onError])

  if (!points) {
    return null
  }

  return <primitive object={points} ref={pointsRef} />
}