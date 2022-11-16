import express from 'express'
const router = express.Router()
import { getTransactions } from '../controllers/transactionController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/').get(protect, admin, getTransactions)

export default router
