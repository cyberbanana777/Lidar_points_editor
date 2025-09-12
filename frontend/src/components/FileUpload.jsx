import { useRef } from 'react'

export default function FileUpload({ onFileUpload }) {
  const fileInputRef = useRef()

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    console.log('File selected:', file?.name)
    
    if (file) {
      // Более гибкая проверка расширения
      const isPcdFile = file.name.toLowerCase().endsWith('.pcd') || 
                       file.name.toLowerCase().endsWith('.ped') // временно разрешим .ped
      
      if (isPcdFile) {
        const reader = new FileReader()
        
        reader.onload = (e) => {
          console.log('File read successfully, size:', e.target.result.byteLength, 'bytes')
          onFileUpload({
            file,
            content: e.target.result
          })
        }
        
        reader.onerror = (error) => {
          console.error('Error reading file:', error)
          alert('Ошибка при чтении файла')
        }
        
        reader.readAsArrayBuffer(file)
        
      } else {
        alert('Пожалуйста, выберите файл в формате .pcd')
      }
    }
  }

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
      <input
        type="file"
        accept=".pcd,.ped" // разрешаем оба расширения временно
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        data-testid="file-input"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: '10px 20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Загрузить PCD файл
      </button>
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Поддерживаются файлы .pcd и .ped
      </div>
    </div>
  )
}