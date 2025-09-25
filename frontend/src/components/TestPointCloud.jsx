import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const PointCloud = ({ pointCloudData, onPointCloudLoad, onPointCloudError }) => {
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
      scene.children.forEach(child => {
        if (child.isPoints) {
          scene.remove(child)
          if (child.geometry) child.geometry.dispose()
          if (child.material) child.material.dispose()
        }
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

      // Создаем цвета на основе высоты
      const colors = new Float32Array(pointCloudData.points.length * 3)
      const { minZ, maxZ } = pointCloudData.bounds
      const heightRange = maxZ - minZ

      pointCloudData.points.forEach((point, i) => {
        const heightRatio = heightRange > 0 ? (point.z - minZ) / heightRange : 0.5
        
        colors[i * 3] = heightRatio // R
        colors[i * 3 + 1] = 0.2     // G 
        colors[i * 3 + 2] = 1 - heightRatio // B
      })

      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.computeBoundingSphere()

      // Создаем материал
      const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        sizeAttenuation: true
      })

      // Создаем объект точек
      const points = new THREE.Points(geometry, material)
      pointsRef.current = points
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

export default PointCloud