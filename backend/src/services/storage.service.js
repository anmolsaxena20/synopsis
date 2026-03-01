const cloudinary = require('cloudinary').v2
const { v4: uuid } = require('uuid')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:  process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function getUploadSignature(fileName) {
  const publicId  = `contracts/${uuid()}-${fileName}`
  const timestamp = Math.round(new Date().getTime() / 1000)

  const paramsToSign = {
    public_id: publicId,
    timestamp:timestamp,
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  )

  return {
    signature,
    timestamp,
    publicId,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  }
}

async function getFileUrl(publicId) {
  return cloudinary.url(publicId, { resource_type: 'raw', secure: true })
}

module.exports = { getUploadSignature, getFileUrl }
