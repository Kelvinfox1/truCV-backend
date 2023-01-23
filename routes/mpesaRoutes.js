import express from 'express'
const router = express.Router()
import {
  access_token,
  welcome,
  stkpush,
  lipaNaMpesaOnlineCallback,
  getTransaction,
} from '../controllers/mpesaController.js'
import { protect } from '../middleware/authMiddleware.js'
import { access } from '../middleware/accessTokenMiddleware.js'

router.route('/').get(welcome)
router.route('/access_token').get(access, access_token)
router.route('/stk').get(access, stkpush)
router.route('/stk_callback').post(lipaNaMpesaOnlineCallback)
router.route('/mytransactions').get(protect, getTransaction)

export default router
