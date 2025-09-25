// src/components/PointCloud.jsx
import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const PointCloud = ({ pointCloudData, onPointCloudLoad, onPointCloudError }) => {
  const objectRef = useRef()
  const { scene, camera } = useThree()

  useEffect(() => {
    try {
      console.log('PointCloud useEffect triggered')
      
      // Очищаем предыдущие объекты
      scene.children.forEach(child => {
        if (child.isMesh || child.isPoints) {
          scene.remove(child)
          if (child.geometry) child.geometry.dispose()
          if (child.material) child.material.dispose()
        }
      })

      let object
      
      if (pointCloudData && pointCloudData.points && pointCloudData.points.length > 0) {
        console.log('Creating point cloud with:', pointCloudData.points.length, 'points')
        
        // Простая нормализация
        const bounds = pointCloudData.bounds
        const scaleFactor = 100 / Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, bounds.maxZ - bounds.minZ)
        
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(pointCloudData.points.length * 3)
        
        pointCloudData.points.forEach((point, i) => {
          positions[i * 3] = (point.x - bounds.minX) * scaleFactor
          positions[i * 3 + 1] = (point.y - bounds.minY) * scaleFactor
          positions[i * 3 + 2] = (point.z - bounds.minZ) * scaleFactor
        })

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        
        const material = new THREE.PointsMaterial({
          size: 0.1,
          color: 0x00ff00,
          sizeAttenuation: true,
        })

        object = new THREE.Points(geometry, material)
        camera.position.set(0, 0, 50)
        camera.lookAt(0, 0, 0)
        
      } else {
        console.log('No point data - creating red cube')
        const geometry = new THREE.BoxGeometry(5, 5, 5)
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        object = new THREE.Mesh(geometry, material)
        camera.position.set(10, 10, 10)
        camera.lookAt(0, 0, 0)
      }

      objectRef.current = object
      scene.add(object)

      console.log('Object successfully created and added to scene')
      onPointCloudLoad?.()

    } catch (error) {
      console.error('Error creating object:', error)
      onPointCloudError?.(error.message)
    }

    return () => {
      if (objectRef.current) {
        scene.remove(objectRef.current)
      }
    }
  }, [pointCloudData, scene, camera, onPointCloudLoad, onPointCloudError])

  return null
}

export default PointCloud