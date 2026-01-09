const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const region = process.env.AWS_REGION
const bucket = process.env.S3_BUCKET

const s3 = new S3Client({ region })

async function generateUploadUrl(key, contentType, expiresIn = 900) {
  if (!bucket) throw new Error('S3_BUCKET not configured')
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })
  const url = await getSignedUrl(s3, command, { expiresIn })
  return url
}

async function downloadFile(key) {
  if (!bucket) throw new Error('S3_BUCKET not configured')
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  })
  const response = await s3.send(command)

  // Convert stream to buffer
  const chunks = []
  for await (const chunk of response.Body) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

module.exports = { generateUploadUrl, downloadFile }
