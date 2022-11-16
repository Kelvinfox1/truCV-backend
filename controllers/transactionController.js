import Subscription from '../models/subscriptionModel.js'
import asyncHandler from 'express-async-handler'

// @desc    Get all transactions
// @route   GET /api/transaction
// @access  Private/Admin
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Subscription.find({})
  res.json(transactions)
})

export { getTransactions }
