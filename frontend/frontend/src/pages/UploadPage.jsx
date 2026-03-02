import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import api from '../api/axios'

export default function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [vendorName, setVendorName] = useState('')
  const [contractTitle, setContractTitle] = useState('')
  const [contractValue, setContractValue] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('idle')
  const [error, setError] = useState('')

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      setFile(accepted[0])
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: () => setError('Only PDF files under 10MB are accepted.'),
  })

  async function handleUpload() {
    if (!file) { setError('Please select a PDF file.'); return }
    if (!vendorName.trim()) { setError('Vendor name is required.'); return }
    if (!contractTitle.trim()) { setError('Contract title is required.'); return }

    setError('')
    setUploading(true)

    try {
      setProgress('signing')
      const sigRes = await api.get(`/contracts/presign?fileName=${encodeURIComponent(file.name)}`)
      const { signature, timestamp, publicId, cloudName, apiKey } = sigRes.data

      setProgress('uploading')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('public_id', publicId)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('api_key', apiKey)

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        { method: 'POST', body: formData }
      )
      const cloudData = await cloudRes.json()

      if (!cloudData.public_id) throw new Error('Cloudinary upload failed')

      setProgress('analyzing')
      const contractRes = await api.post('/contracts', {
        fileName: file.name,
        s3Key: cloudData.public_id,
        vendorName: vendorName.trim(),
        contractTitle: contractTitle.trim(),
        contractValue: contractValue.trim() || null,
      })

      navigate(`/dashboard?id=${contractRes.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed. Please try again.')
      setProgress('idle')
    } finally {
      setUploading(false)
    }
  }

  function removeFile() {
    setFile(null)
    setError('')
    setProgress('idle')
  }

  const progressSteps = [
    { key: 'signing',   label: 'Preparing upload'    },
    { key: 'uploading', label: 'Uploading file'       },
    { key: 'analyzing', label: 'AI is analyzing...'  },
  ]

  const currentStep = progressSteps.findIndex(s => s.key === progress)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Contract</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a vendor PDF and get a full AI risk report in under 60 seconds.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : file
              ? 'border-green-400 bg-green-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <polyline points="9 15 12 18 15 15"/>
                  <line x1="12" y1="11" x2="12" y2="18"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeFile() }}
                className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {isDragActive ? 'Drop your PDF here' : 'Drag & drop your contract PDF'}
                </p>
                <p className="text-xs text-gray-400 mt-1">or click to browse — PDF only, max 10MB</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Salesforce Inc."
              value={vendorName}
              onChange={e => setVendorName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-150"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Contract Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. SaaS Master Agreement"
              value={contractTitle}
              onChange={e => setContractTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-150"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Contract Value <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. $24,000/year"
            value={contractValue}
            onChange={e => setContractValue(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-150"
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {uploading && (
          <div className="space-y-3">
            {progressSteps.map((step, i) => (
              <div key={step.key} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  i < currentStep
                    ? 'bg-green-500'
                    : i === currentStep
                    ? 'bg-blue-600'
                    : 'bg-gray-100'
                }`}>
                  {i < currentStep ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : i === currentStep ? (
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>
                <span className={`text-sm transition-colors duration-200 ${
                  i === currentStep ? 'text-gray-900 font-medium' : i < currentStep ? 'text-gray-400' : 'text-gray-300'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${
            uploading || !file
              ? 'bg-blue-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
          }`}
        >
          {uploading ? 'Processing...' : 'Analyze Contract'}
        </button>
      </div>
    </div>
  )
}