'use client'

import { useState, useRef } from 'react'
import {
  FileHandler,
  UploadProgress,
  UploadResult,

  FileListValidationResult,
  ResizeResult,
  ResizeOptions,
} from '@cm/class/FileHandler/FileHandler'

type TestSection = 'single' | 'multiple' | 'validation' | 'resize' | 'delete'

export function FileUploadTestClient() {
  const [activeSection, setActiveSection] = useState<TestSection>('single')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 100))
  }

  const clearLogs = () => setLogs([])

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>File Upload Test Page</h1>

      {/* Navigation */}
      <nav style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {[
          { key: 'single', label: 'Single Upload' },
          { key: 'multiple', label: 'Multiple Upload' },
          { key: 'validation', label: 'Validation Test' },
          { key: 'resize', label: 'Resize Test' },
          { key: 'delete', label: 'Delete Test' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setActiveSection(item.key as TestSection)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeSection === item.key ? '#0070f3' : '#eee',
              color: activeSection === item.key ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Test Sections */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '400px' }}>
          {activeSection === 'single' && <SingleUploadTest addLog={addLog} />}
          {activeSection === 'multiple' && <MultipleUploadTest addLog={addLog} />}
          {activeSection === 'validation' && <ValidationTest addLog={addLog} />}
          {activeSection === 'resize' && <ResizeTest addLog={addLog} />}
          {activeSection === 'delete' && <DeleteTest addLog={addLog} />}
        </div>

        {/* Log Panel */}
        <div
          style={{
            flex: '1',
            minWidth: '300px',
            backgroundColor: '#1a1a2e',
            color: '#00ff00',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            maxHeight: '600px',
            overflow: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <strong>Logs</strong>
            <button
              onClick={clearLogs}
              style={{
                padding: '3px 10px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Clear
            </button>
          </div>
          {logs.length === 0 ? (
            <div style={{ color: '#666' }}>No logs yet...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ marginBottom: '5px', wordBreak: 'break-all' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Single Upload Test
function SingleUploadTest({ addLog }: { addLog: (msg: string) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [bucketKey, setBucketKey] = useState('test-uploads')
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setResult(null)
    setProgress(null)
    if (selectedFile) {
      const info = FileHandler.getFileInfo(selectedFile)
      addLog(`File selected: ${info.name} (${info.sizeFormatted})`)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      addLog('Error: No file selected')
      return
    }

    setIsUploading(true)
    setProgress(null)
    addLog(`Starting upload: ${file.name}`)

    const uploadResult = await FileHandler.sendFileToS3({
      file,
      formDataObj: { bucketKey },
      onProgress: p => {
        setProgress(p)
        addLog(`Progress: ${p.percentage}%`)
      },
    })

    setResult(uploadResult)
    setIsUploading(false)

    if (uploadResult.success) {
      addLog(`Upload success! URL: ${uploadResult.result?.url}`)
    } else {
      addLog(`Upload failed: ${uploadResult.message}`)
      addLog(`Error details: ${JSON.stringify(uploadResult.error)}`)
    }
  }

  return (
    <div style={sectionStyle}>
      <h2>Single File Upload</h2>

      <div style={{ marginBottom: '15px' }}>
        <label style={labelStyle}>Bucket Key:</label>
        <input type="text" value={bucketKey} onChange={e => setBucketKey(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ marginBottom: '10px' }} />
        {file && (
          <div style={fileInfoStyle}>
            <strong>{file.name}</strong>
            <br />
            Size: {FileHandler.getFileInfo(file).sizeFormatted}
            <br />
            Type: {file.type}
          </div>
        )}
      </div>

      <button onClick={handleUpload} disabled={!file || isUploading} style={buttonStyle}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>

      {progress && (
        <div style={{ marginTop: '15px' }}>
          <div style={progressBarContainer}>
            <div style={{ ...progressBarFill, width: `${progress.percentage}%` }} />
          </div>
          <div style={{ textAlign: 'center', marginTop: '5px' }}>{progress.percentage}%</div>
        </div>
      )}

      {result && (
        <div style={{ ...resultStyle, backgroundColor: result.success ? '#d4edda' : '#f8d7da' }}>
          <strong>{result.success ? 'Success' : 'Failed'}</strong>
          <br />
          {result.message}
          {result.result?.url && (
            <>
              <br />
              <a href={result.result.url} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
                {result.result.url}
              </a>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Multiple Upload Test
function MultipleUploadTest({ addLog }: { addLog: (msg: string) => void }) {
  const [files, setFiles] = useState<File[]>([])
  const [bucketKey, setBucketKey] = useState('test-uploads')
  const [results, setResults] = useState<UploadResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isUploading, setIsUploading] = useState(false)

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
    setResults([])
    addLog(`${selectedFiles.length} files selected`)
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      addLog('Error: No files selected')
      return
    }

    setIsUploading(true)
    setResults([])
    addLog(`Starting batch upload of ${files.length} files`)

    const uploadResults = await FileHandler.uploadMultipleFiles(files, bucketKey, (index, progress) => {
      setCurrentIndex(index)
      addLog(`File ${index + 1}/${files.length}: ${progress.percentage}%`)
    })

    setResults(uploadResults)
    setIsUploading(false)
    setCurrentIndex(-1)

    const successCount = uploadResults.filter(r => r.success).length
    addLog(`Batch complete: ${successCount}/${files.length} successful`)
  }

  return (
    <div style={sectionStyle}>
      <h2>Multiple File Upload</h2>

      <div style={{ marginBottom: '15px' }}>
        <label style={labelStyle}>Bucket Key:</label>
        <input type="text" value={bucketKey} onChange={e => setBucketKey(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <input type="file" multiple onChange={handleFilesChange} />
        {files.length > 0 && (
          <div style={fileInfoStyle}>
            {files.length} files selected
            <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
              {files.map((f, i) => (
                <li key={i}>
                  {f.name} ({FileHandler.getFileInfo(f).sizeFormatted})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button onClick={handleUpload} disabled={files.length === 0 || isUploading} style={buttonStyle}>
        {isUploading ? `Uploading ${currentIndex + 1}/${files.length}...` : 'Upload All'}
      </button>

      {results.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <h4>Results:</h4>
          {results.map((r, i) => (
            <div key={i} style={{ ...resultStyle, backgroundColor: r.success ? '#d4edda' : '#f8d7da', marginBottom: '5px' }}>
              <strong>
                {files[i]?.name}: {r.success ? 'Success' : 'Failed'}
              </strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Validation Test
function ValidationTest({ addLog }: { addLog: (msg: string) => void }) {
  const [files, setFiles] = useState<File[]>([])
  const [validationResult, setValidationResult] = useState<FileListValidationResult | null>(null)

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
    setValidationResult(null)
    addLog(`${selectedFiles.length} files selected for validation`)
  }

  const handleValidate = () => {
    if (files.length === 0) {
      addLog('Error: No files selected')
      return
    }

    addLog('Starting validation...')
    const result = FileHandler.validateFileList(files)
    setValidationResult(result)

    addLog(`Validation complete: ${result.summary.validFiles}/${result.summary.totalFiles} valid`)
    if (result.errorMessages.length > 0) {
      result.errorMessages.forEach(msg => addLog(`Error: ${msg}`))
    }
  }

  return (
    <div style={sectionStyle}>
      <h2>File Validation Test</h2>

      <div style={{ marginBottom: '15px' }}>
        <input type="file" multiple onChange={handleFilesChange} />
      </div>

      <button onClick={handleValidate} disabled={files.length === 0} style={buttonStyle}>
        Validate Files
      </button>

      {validationResult && (
        <div style={{ marginTop: '15px' }}>
          <h4>Validation Summary:</h4>
          <div style={summaryStyle}>
            <div>Total Files: {validationResult.summary.totalFiles}</div>
            <div style={{ color: 'green' }}>Valid: {validationResult.summary.validFiles}</div>
            <div style={{ color: 'red' }}>Invalid: {validationResult.summary.invalidFiles}</div>
            <div>Oversized: {validationResult.summary.oversizedFiles}</div>
            <div>Unsupported: {validationResult.summary.unsupportedFiles}</div>
            <div>Total Size: {validationResult.totalSizeFormatted}</div>
          </div>

          {validationResult.invalidFiles.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <h5>Invalid Files:</h5>
              {validationResult.invalidFiles.map((inv, i) => (
                <div key={i} style={{ ...resultStyle, backgroundColor: '#f8d7da' }}>
                  <strong>{inv.file.name}</strong>
                  <ul>
                    {inv.errors.map((err, j) => (
                      <li key={j}>{err}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Resize Test
function ResizeTest({ addLog }: { addLog: (msg: string) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [options, setOptions] = useState<ResizeOptions>({
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.8,
    format: 'jpeg',
    maintainAspectRatio: true,
  })
  const [result, setResult] = useState<ResizeResult | null>(null)
  const [preview, setPreview] = useState<{ original: string; resized: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setResult(null)
    setPreview(null)
    if (selectedFile) {
      addLog(`Image selected: ${selectedFile.name}`)
    }
  }

  const handleResize = async () => {
    if (!file) {
      addLog('Error: No file selected')
      return
    }

    setIsProcessing(true)
    addLog('Starting resize...')

    const resizeResult = await FileHandler.resizeImage(file, options)
    setResult(resizeResult)

    if (resizeResult.success && resizeResult.resizedFile) {
      setPreview({
        original: URL.createObjectURL(file),
        resized: URL.createObjectURL(resizeResult.resizedFile),
      })
      addLog(`Resize success! Compression: ${resizeResult.compressionRatio?.toFixed(1)}%`)
    } else {
      addLog(`Resize failed: ${resizeResult.error}`)
    }

    setIsProcessing(false)
  }

  return (
    <div style={sectionStyle}>
      <h2>Image Resize Test</h2>

      <div style={{ marginBottom: '15px' }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
        <div>
          <label style={labelStyle}>Max Width:</label>
          <input
            type="number"
            value={options.maxWidth}
            onChange={e => setOptions({ ...options, maxWidth: parseInt(e.target.value) })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Max Height:</label>
          <input
            type="number"
            value={options.maxHeight}
            onChange={e => setOptions({ ...options, maxHeight: parseInt(e.target.value) })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Quality (0-1):</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={options.quality}
            onChange={e => setOptions({ ...options, quality: parseFloat(e.target.value) })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Format:</label>
          <select
            value={options.format}
            onChange={e => setOptions({ ...options, format: e.target.value as 'jpeg' | 'png' | 'webp' })}
            style={inputStyle}
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>
          <input
            type="checkbox"
            checked={options.maintainAspectRatio}
            onChange={e => setOptions({ ...options, maintainAspectRatio: e.target.checked })}
          />{' '}
          Maintain Aspect Ratio
        </label>
      </div>

      <button onClick={handleResize} disabled={!file || isProcessing} style={buttonStyle}>
        {isProcessing ? 'Processing...' : 'Resize Image'}
      </button>

      {result && (
        <div style={{ marginTop: '15px' }}>
          <div style={summaryStyle}>
            <div>Original Size: {FileHandler.getFileInfo(result.originalFile).sizeFormatted}</div>
            {result.resizedFile && <div>Resized Size: {FileHandler.getFileInfo(result.resizedFile).sizeFormatted}</div>}
            {result.compressionRatio !== undefined && <div>Compression: {result.compressionRatio.toFixed(1)}%</div>}
          </div>

          {preview && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
              <div>
                <h5>Original:</h5>
                <img src={preview.original} alt="Original" style={{ maxWidth: '200px', maxHeight: '200px' }} />
              </div>
              <div>
                <h5>Resized:</h5>
                <img src={preview.resized} alt="Resized" style={{ maxWidth: '200px', maxHeight: '200px' }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Delete Test
function DeleteTest({ addLog }: { addLog: (msg: string) => void }) {
  const [fileUrl, setFileUrl] = useState('')
  const [bucketKey, setBucketKey] = useState('test-uploads')
  const [isDeleting, setIsDeleting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleDelete = async () => {
    if (!fileUrl) {
      addLog('Error: No URL provided')
      return
    }

    setIsDeleting(true)
    addLog(`Deleting: ${fileUrl}`)

    const deleteResult = await FileHandler.deleteFileFromS3(fileUrl, bucketKey)
    setResult(deleteResult)

    if (deleteResult.success) {
      addLog('Delete success!')
    } else {
      addLog(`Delete failed: ${deleteResult.message}`)
    }

    setIsDeleting(false)
  }

  return (
    <div style={sectionStyle}>
      <h2>File Delete Test</h2>

      <div style={{ marginBottom: '15px' }}>
        <label style={labelStyle}>File URL:</label>
        <input
          type="text"
          value={fileUrl}
          onChange={e => setFileUrl(e.target.value)}
          placeholder="https://bucket.s3.region.amazonaws.com/key/file.jpg"
          style={{ ...inputStyle, width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={labelStyle}>Bucket Key:</label>
        <input type="text" value={bucketKey} onChange={e => setBucketKey(e.target.value)} style={inputStyle} />
      </div>

      <button onClick={handleDelete} disabled={!fileUrl || isDeleting} style={{ ...buttonStyle, backgroundColor: '#dc3545' }}>
        {isDeleting ? 'Deleting...' : 'Delete File'}
      </button>

      {result && (
        <div style={{ ...resultStyle, backgroundColor: result.success ? '#d4edda' : '#f8d7da', marginTop: '15px' }}>
          <strong>{result.success ? 'Deleted' : 'Failed'}</strong>
          <br />
          {result.message}
        </div>
      )}
    </div>
  )
}

// Styles
const sectionStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '20px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: 'bold',
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  fontSize: '14px',
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
}

const fileInfoStyle: React.CSSProperties = {
  backgroundColor: '#e9ecef',
  padding: '10px',
  borderRadius: '4px',
  marginTop: '10px',
}

const resultStyle: React.CSSProperties = {
  padding: '15px',
  borderRadius: '4px',
  marginTop: '15px',
}

const summaryStyle: React.CSSProperties = {
  backgroundColor: '#e9ecef',
  padding: '15px',
  borderRadius: '4px',
}

const progressBarContainer: React.CSSProperties = {
  width: '100%',
  height: '20px',
  backgroundColor: '#e9ecef',
  borderRadius: '10px',
  overflow: 'hidden',
}

const progressBarFill: React.CSSProperties = {
  height: '100%',
  backgroundColor: '#0070f3',
  transition: 'width 0.3s ease',
}
