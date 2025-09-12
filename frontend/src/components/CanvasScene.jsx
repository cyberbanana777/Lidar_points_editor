import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import PointCloud from './PointCloud'
import TestPointCloud from './TestPointCloud'
import { useEffect, useState } from 'react'

export default function CanvasScene({ pointCloudData, onPointCloudLoad, onPointCloudError }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        background: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        Loading 3D Viewer...
      </div>
    )
  }

  return (
    <Canvas
      camera={{
        position: [15, 15, 15], // Отодвинем камеру подальше
        fov: 60,
        near: 0.1,
        far: 1000
      }}
      style={{ width: '100%', height: '100vh', background: '#1a1a1a' }}
      onCreated={({ gl }) => {
        // Добавим обработчик потери контекста
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          console.log('WebGL context lost')
          event.preventDefault()
        })
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Всегда показываем тестовые точки для ориентира */}
      <TestPointCloud />
      
      {/* Загруженные точки */}
      {pointCloudData && (
        <PointCloud 
          data={pointCloudData} 
          onLoad={onPointCloudLoad}
          onError={onPointCloudError}
        />
      )}
      
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        makeDefault
      />
      
      <axesHelper args={[10]} />
      <gridHelper args={[20, 20]} />
    </Canvas>
  )
}