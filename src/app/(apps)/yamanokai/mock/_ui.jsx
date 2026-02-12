// =============================================================================
// 共通UIコンポーネント
// =============================================================================

/** モーダル */
export const Modal = ({isOpen, onClose, title, children, size = 'md'}) => {
  if (!isOpen) return null
  const sizeClass = size === 'lg' ? 'max-w-4xl' : size === 'sm' ? 'max-w-md' : 'max-w-2xl'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClass} max-h-[90vh] overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">{children}</div>
      </div>
    </div>
  )
}

/** バッジ */
export const Badge = ({children, color, bgColor}) => (
  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{color, backgroundColor: bgColor}}>
    {children}
  </span>
)

/** ボタン */
export const Button = ({children, variant = 'primary', size = 'md', onClick, disabled, className = ''}) => {
  const baseClass = 'rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  }[variant]
  return (
    <button className={`${baseClass} ${sizeClass} ${variantClass} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

/** カード */
export const Card = ({children, className = ''}) => <div className={`bg-white rounded-lg shadow border ${className}`}>{children}</div>

/** 入力フィールド */
export const FormField = ({label, required, children}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
)

/** テキストインプット */
export const Input = ({type = 'text', value, onChange, placeholder, className = '', min}) => (
  <input
    type={type}
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    min={min}
    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
)

/** セレクト */
export const Select = ({value, onChange, options, placeholder, className = ''}) => (
  <select
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
)

/** テキストエリア */
export const Textarea = ({value, onChange, placeholder, rows = 3, className = ''}) => (
  <textarea
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
)
