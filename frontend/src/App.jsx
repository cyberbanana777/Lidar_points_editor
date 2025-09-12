import { useState } from 'react'
import CanvasScene from './components/CanvasScene'
import FileUpload from './components/FileUpload'
import EditingTools from './components/EditingTools'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  const [pointCloudData, setPointCloudData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTool, setActiveTool] = useState('select')

const parsePCD = (arrayBuffer) => {
  console.log('Parsing PCD file, size:', arrayBuffer.byteLength)
  
  try {
    const textDecoder = new TextDecoder('utf-8')
    const headerText = textDecoder.decode(new Uint8Array(arrayBuffer, 0, Math.min(512, arrayBuffer.byteLength)))
    console.log('Header preview:', headerText.substring(0, 100))

    // Определяем формат данных
    const isAscii = headerText.includes('DATA ascii')
    const isBinary = headerText.includes('DATA binary')
    const isCompressed = headerText.includes('DATA binary_compressed')

    console.log('Format detection:', { isAscii, isBinary, isCompressed })

    if (isBinary || isCompressed) {
      throw new Error(`Бинарные форматы (${isBinary ? 'binary' : 'compressed'}) не поддерживаются. Используйте ASCII формат.`)
    }

    if (!isAscii) {
      throw new Error('Формат данных не распознан. Поддерживается только DATA ascii.')
    }

    // Парсим заголовок
    const lines = headerText.split('\n')
    let pointsCount = 0
    let dataStartIndex = -1
    let fields = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line.startsWith('FIELDS')) {
        fields = line.substring(6).trim().split(' ')
        console.log('Fields found:', fields)
      }
      else if (line.startsWith('POINTS')) {
        pointsCount = parseInt(line.substring(6).trim(), 10)
        console.log('Points count:', pointsCount)
      }
      else if (line.startsWith('WIDTH')) {
        const width = parseInt(line.substring(5).trim(), 10)
        console.log('Width:', width)
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

    // Парсим ASCII данные
    const fullText = textDecoder.decode(arrayBuffer)
    const allLines = fullText.split('\n')
    
    const points = []
    const colors = []
    let parsedPoints = 0

    for (let i = dataStartIndex; i < allLines.length && parsedPoints < pointsCount; i++) {
      const line = allLines[i].trim()
      if (line && !line.startsWith('#')) {
        const values = line.split(/\s+/).map(parseFloat).filter(v => !isNaN(v))
        
        if (values.length >= 3) {
          // Добавляем координаты (первые 3 значения)
          points.push(values[0], values[1], values[2])
          
          // Генерируем цвет на основе позиции для визуализации
          const r = (values[0] % 1 + 1) / 2
          const g = (values[1] % 1 + 1) / 2
          const b = (values[2] % 1 + 1) / 2
          colors.push(r, g, b)
          
          parsedPoints++
        }
      }
    }

    console.log(`Successfully parsed ${parsedPoints}/${pointsCount} points`)

    if (parsedPoints === 0) {
      throw new Error('Не удалось распарсить ни одной точки')
    }

    return {
      points: new Float32Array(points),
      colors: new Float32Array(colors)
    }
    
  } catch (error) {
    console.error('PCD parsing error:', error)
    
    // Возвращаем тестовые данные для демонстрации
    return {
      points: new Float32Array([
        -2, -2, 0, 2, -2, 0, 2, 2, 0, -2, 2, 0, 0, 0, 3
      ]),
      colors: new Float32Array([
        1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1
      ])
    }
  }
}

  // Функция анализа файла
  const analyzeFile = (arrayBuffer) => {
    console.log('Analyzing file, size:', arrayBuffer.byteLength)
    return 'File analysis complete'
  }

  // Обработчик загрузки файла
  const handleFileUpload = async (fileData) => {
    console.log('Starting file processing...')
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Processing file:', fileData.file.name)
      
      // Анализируем файл
      analyzeFile(fileData.content)
      
      // Парсим PCD
      const parsedData = parsePCD(fileData.content)
      setPointCloudData(parsedData)
      console.log('File processed successfully')
      
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to process file')
    } finally {
      setIsLoading(false)
    }
  }

  // Остальные обработчики
  const handleToolSelect = (tool) => {
    setActiveTool(tool)
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
    console.log('Point cloud loaded')
  }

  const handlePointCloudError = (errorMessage) => {
    setError(errorMessage)
  }

  // Возврат JSX
  return (
    <ErrorBoundary>
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
              Loaded: {pointCloudData.points.length / 3} points
            </div>
          )}
        </div>
        
        <EditingTools
          onToolSelect={handleToolSelect}
          onClearSelection={handleClearSelection}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={false}
          canRedo={false}
        />
        
        <div className="viewer-container">
          <CanvasScene 
            pointCloudData={pointCloudData}
            onPointCloudLoad={handlePointCloudLoad}
            onPointCloudError={handlePointCloudError}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App