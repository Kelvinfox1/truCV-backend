import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mechant_request_id: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  result_code: {
    type: String,
  },
  result_desc: {
    type: String,
  },
  callback_metadata: { type: mongoose.Schema.Types.Mixed },
})

const Transaction = mongoose.model('Transaction', transactionSchema)
export default Transaction
