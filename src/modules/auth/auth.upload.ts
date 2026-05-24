import multer from 'multer'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const uploadsRoot = path.resolve(process.cwd(), 'uploads', 'auth-documents')
fs.mkdirSync(uploadsRoot, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsRoot),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase()
    const randomName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`
    cb(null, randomName)
  },
})

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])

export const authUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error('Invalid file type. Allowed: PDF, JPEG, PNG, WEBP'))
      return
    }

    cb(null, true)
  },
})
