import { useRef } from 'react'

const FileUpload = ({ onFileUpload }) => {
  const fileInputRef = useRef()

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    console.log('File selected:', file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      console.log('File read successfully, size:', e.target.result.byteLength)
      onFileUpload({
        file: file,
        content: e.target.result
      })
    }
    reader.onerror = () => {
      console.error('File reading error')
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="file-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pcd"
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current?.click()}>
        Upload PCD File
      </button>
    </div>
  )
}

export default FileUpload