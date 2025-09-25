// src/App.jsx
import { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import FileUpload from './components/FileUpload'
import EditingTools from './components/EditingTools'
import PointCloud from './components/PointCloud' // Импорт из отдельного файла
import './App.css'

function App() {
  const [pointCloudData, setPointCloudData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTool, setActiveTool] = useState('select')
  const orbitControlsRef = useRef()

  useEffect(() => {
    if (orbitControlsRef.current) {
      window.orbitControls = orbitControlsRef.current
    }
    return () => {
      window.orbitControls = null
    }
  }, [])

  // Функция для расчета границ точек
  const calculateBounds = (points) => {
    if (!points || points.length === 0) {
      return { minX: -1, maxX: 1, minY: -1, maxY: 1, minZ: -1, maxZ: 1 }
    }

    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity  
    let minZ = Infinity, maxZ = -Infinity

    points.forEach(point => {
      minX = Math.min(minX, point.x)
      maxX = Math.max(maxX, point.x)
      minY = Math.min(minY, point.y)
      maxY = Math.max(maxY, point.y)
      minZ = Math.min(minZ, point.z)
      maxZ = Math.max(maxZ, point.z)
    })

    return { minX, maxX, minY, maxY, minZ, maxZ }
  }

  // Функция парсинга PCD файла
  const parsePCD = (arrayBuffer) => {
    console.log('Parsing PCD file, size:', arrayBuffer.byteLength)
    
    try {
      const textDecoder = new TextDecoder('utf-8')
      const headerText = textDecoder.decode(new Uint8Array(arrayBuffer, 0, Math.min(512, arrayBuffer.byteLength)))
      console.log('Header preview:', headerText.substring(0, 100))

      const lines = headerText.split('\n')
      let pointsCount = 0
      let dataStartIndex = -1

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        if (line.startsWith('POINTS')) {
          pointsCount = parseInt(line.substring(6).trim(), 10)
          console.log('Points count:', pointsCount)
        }
        else if (line === 'DATA ascii') {
          dataStartIndex = i + 1
          console.log('Data starts at line:', dataStartIndex)
          break
        }
      }

      if (dataStartIndex === -1) {
        throw new Error('Не удалось найти начало данных (DATA ascii)')
      }

      if (pointsCount === 0) {
        throw new Error('Количество точек не указано или равно 0')
      }

      // Находим точное начало данных
      const fullText = textDecoder.decode(arrayBuffer)
      const dataStartByte = fullText.indexOf('DATA ascii') + 'DATA ascii'.length
      const dataText = fullText.substring(dataStartByte).trim()
      
      const allLines = dataText.split('\n')
      const points = []
      let parsedPoints = 0

      for (let i = 0; i < allLines.length && parsedPoints < pointsCount; i++) {
        const line = allLines[i].trim()
        if (line && !line.startsWith('#')) {
          const values = line.split(/\s+/).map(parseFloat).filter(v => !isNaN(v))
          
          if (values.length >= 3) {
            points.push({
              x: values[0],
              y: values[1], 
              z: values[2],
              intensity: values.length > 3 ? values[3] : 0
            })
            parsedPoints++
          }
        }
      }

      console.log(`Successfully parsed ${parsedPoints}/${pointsCount} points`)

      // Даунсемплинг
      let finalPoints = points
      if (parsedPoints > 50000) {
        console.log(`Downsampling ${parsedPoints} points...`)
        const step = Math.ceil(parsedPoints / 50000)
        finalPoints = []
        
        for (let i = 0; i < points.length; i += step) {
          if (i < points.length) {
            finalPoints.push(points[i])
          }
        }
        console.log(`Downsampled to ${finalPoints.length} points`)
      }

      if (finalPoints.length === 0) {
        throw new Error('Не удалось распарсить ни одной точки')
      }

      return {
        points: finalPoints,
        pointCount: finalPoints.length,
        bounds: calculateBounds(finalPoints)
      }
      
    } catch (error) {
      console.error('PCD parsing error:', error)
      
      // Тестовые данные
      const testPoints = [
        { x: -2, y: -2, z: 0, intensity: 1 },
        { x: 2, y: -2, z: 0, intensity: 1 },
        { x: 2, y: 2, z: 0, intensity: 1 },
        { x: -2, y: 2, z: 0, intensity: 1 },
        { x: 0, y: 0, z: 3, intensity: 1 }
      ]
      
      return {
        points: testPoints,
        pointCount: testPoints.length,
        bounds: calculateBounds(testPoints)
      }
    }
  }

  // Обработчик загрузки файла
  const handleFileUpload = async (fileData) => {
    console.log('Starting file processing...')
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Processing file:', fileData.file.name)
      
      const parsedData = parsePCD(fileData.content)
      setPointCloudData(parsedData)
      console.log('File processed successfully', {
        points: parsedData.points.length,
        bounds: parsedData.bounds
      })
      
    } catch (error) {
      console.error('Error:', error)
      setError(`Failed to process file: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Остальные обработчики
  const handleToolSelect = (tool) => {
    setActiveTool(tool)
    console.log('Tool selected:', tool)
  }

  const handleClearSelection = () => {
    console.log('Clear selection')
  }

  const handleUndo = () => {
    console.log('Undo')
  }

  const handleRedo = () => {
    console.log('Redo')
  }

  const handlePointCloudLoad = () => {
    console.log('Point cloud loaded in scene')
  }

  const handlePointCloudError = (errorMessage) => {
    setError(`3D Error: ${errorMessage}`)
  }

  return (
    <div className="app">
      <div className="toolbar">
        <h2>Lidar Editor</h2>
        <FileUpload onFileUpload={handleFileUpload} />
        {isLoading && <div className="loading">Processing...</div>}
        {error && (
          <div className="error">
            Error: {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
        {pointCloudData && (
          <div className="success">
            Loaded: {pointCloudData.pointCount} points
          </div>
        )}
      </div>
      
      <EditingTools
        activeTool={activeTool}
        onToolSelect={handleToolSelect}
        onClearSelection={handleClearSelection}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={false}
        canRedo={false}
      />
      
      <div className="viewer-container">
        <Canvas
          camera={{ 
            position: [0, 0, 100],
            fov: 60,
            near: 0.1,
            far: 100000
          }}
          style={{ background: '#1e1e1e' }}
        >
          <color attach="background" args={['#1e1e1e']} />
          <ambientLight intensity={0.8} />
          <pointLight position={[1000, 1000, 1000]} intensity={1} />
          
          <OrbitControls 
            ref={orbitControlsRef}
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={1}
            maxDistance={100000}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
          />
          
          <PointCloud 
            pointCloudData={pointCloudData}
            onPointCloudLoad={handlePointCloudLoad}
            onPointCloudError={handlePointCloudError}
          />
        </Canvas>
      </div>
    </div>
  )
}

export default App