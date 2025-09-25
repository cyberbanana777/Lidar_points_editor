import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const CanvasScene = ({ pointCloudData, activeTool, onPointCloudLoad, onPointCloudError }) => {
  const pointsRef = useRef()
  const { scene, camera } = useThree()

  useEffect(() => {
    if (!pointCloudData || !pointCloudData.points || pointCloudData.points.length === 0) {
      console.log('No point cloud data available')
      return
    }

    try {
      console.log('Creating point cloud with:', pointCloudData.points.length, 'points')

      // Очищаем предыдущие точки
      const pointsToRemove = []
      scene.children.forEach(child => {
        if (child.isPoints) {
          pointsToRemove.push(child)
        }
      })
      
      pointsToRemove.forEach(child => {
        scene.remove(child)
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })

      // Создаем геометрию
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(pointCloudData.points.length * 3)
      
      // Заполняем позиции
      pointCloudData.points.forEach((point, i) => {
        positions[i * 3] = point.x || 0
        positions[i * 3 + 1] = point.y || 0
        positions[i * 3 + 2] = point.z || 0
      })

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.computeBoundingSphere()

      // Простой материал без цветов
      const material = new THREE.PointsMaterial({
        size: 0.1,
        color: 0x00ff00, // Зеленый цвет для всех точек
        sizeAttenuation: true
      })

      // Создаем объект точек
      const points = new THREE.Points(geometry, material)
      scene.add(points)

      // Настраиваем камеру
      if (geometry.boundingSphere) {
        const { center, radius } = geometry.boundingSphere
        camera.position.set(center.x + radius * 2, center.y + radius * 2, center.z + radius * 2)
        camera.lookAt(center)
      }

      console.log('Point cloud successfully created')
      onPointCloudLoad?.()

    } catch (error) {
      console.error('Error creating point cloud:', error)
      onPointCloudError?.(error.message)
    }

    // Cleanup
    return () => {
      if (pointsRef.current) {
        scene.remove(pointsRef.current)
      }
    }
  }, [pointCloudData, scene, camera, onPointCloudLoad, onPointCloudError])

  return null
}

export default CanvasScene