export default function EditingTools({ 
  onToolSelect, 
  onClearSelection, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo 
}) {
  return (
    <div style={{ 
      padding: '10px', 
      background: '#f0f0f0', 
      borderRadius: '8px', 
      margin: '10px 0',
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    }}>
      <button onClick={() => onToolSelect('select')}>
        Select
      </button>
      <button onClick={() => onToolSelect('lasso')}>
        Lasso
      </button>
      <button onClick={onClearSelection}>
        Clear
      </button>
    </div>
  )
}