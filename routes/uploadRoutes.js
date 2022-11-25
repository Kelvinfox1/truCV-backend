import path from 'path'
import express from 'express'
import { AffindaAPI, AffindaCredential } from '@affinda/affinda'
import fs from 'fs'
import multer from 'multer'
const router = express.Router()

const credential = new AffindaCredential(
  '56ef43f875ebee6da496b8524a7c3ded2a06fa0c'
)

const client = new AffindaAPI(credential)

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    )
  },
})

function checkFileType(file, cb) {
  const filetypes = /pdf/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb('PDF only!')
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  },
})

router.post('/', upload.single('file'), (req, res) => {
  const __dirname = path.resolve()
  const pdfpath = path.join(__dirname, `/${req.file.path}`)

  const readStream = fs.createReadStream(pdfpath)

  client
    .createResume({ file: readStream })
    .then((result) => {
      console.log('Returned data:')
      res.json(result)
    })
    .catch((err) => {
      console.log('An error occurred:')
      console.error(err)
    })
})

export default router
