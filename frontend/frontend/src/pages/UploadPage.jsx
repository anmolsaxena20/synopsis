
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
    { key: 'signing',   label: 'Preparing upload' },
    { key: 'uploading', label: 'Uploading file' },
    { key: 'analyzing', label: 'AI is analyzing...' },
  ]

  const currentStep = progressSteps.findIndex(s => s.key === progress)

  return (
    <div className="min-h-screen flex justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-white to-blue-100">

      <div className="max-w-2xl w-full">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Upload Contract</h1>
          <p className="text-sm text-blue-700/70 mt-1">
            Upload a vendor PDF and get a full AI risk report in under 60 seconds.
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/80 border border-blue-100 rounded-2xl p-8 shadow-xl shadow-blue-100/40 space-y-6">

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                : file
                ? 'border-green-400 bg-green-50'
                : 'border-blue-100 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <input {...getInputProps()} />

            {file ? (
              <div className="flex flex-col items-center gap-3">

                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); removeFile() }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium transition"
                >
                  Remove file
                </button>

              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">

                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow">
                  ↑
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {isDragActive ? 'Drop your PDF here' : 'Drag & drop your contract PDF'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    or click to browse — PDF only, max 10MB
                  </p>
                </div>

              </div>
            )}
          </div>

          {/* Inputs */}

          <div className="grid grid-cols-2 gap-4">

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={e => setVendorName(e.target.value)}
                placeholder="e.g. Salesforce Inc."
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-blue-100 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Contract Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contractTitle}
                onChange={e => setContractTitle(e.target.value)}
                placeholder="e.g. SaaS Master Agreement"
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-blue-100 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              />
            </div>

          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Contract Value <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={contractValue}
              onChange={e => setContractValue(e.target.value)}
              placeholder="e.g. $24,000/year"
              className="w-full px-4 py-2.5 text-sm rounded-lg border border-blue-100 bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Progress */}

          {uploading && (
            <div className="space-y-3">

              {progressSteps.map((step, i) => (
                <div key={step.key} className="flex items-center gap-3">

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    i < currentStep
                      ? 'bg-green-500'
                      : i === currentStep
                      ? 'bg-blue-600 animate-pulse'
                      : 'bg-blue-100'
                  }`} />

                  <span className={`text-sm ${
                    i === currentStep
                      ? 'text-blue-900 font-medium'
                      : i < currentStep
                      ? 'text-gray-400'
                      : 'text-gray-300'
                  }`}>
                    {step.label}
                  </span>

                </div>
              ))}

            </div>
          )}

          {/* Button */}

          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 shadow ${
              uploading || !file
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:scale-[0.98]'
            }`}
          >
            {uploading ? 'Processing...' : 'Analyze Contract'}
          </button>

        </div>

      </div>

    </div>
  )
}