import mongoose from 'mongoose'

const subscriptionSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    paidAt: {
      type: Date,
    },
    package: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const Subscription = mongoose.model('Subscription', subscriptionSchema)

export default Subscription
