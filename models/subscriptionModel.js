import mongoose from 'mongoose'

const subscriptionSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    paymentResult: {
      type: Object,
    },
    paidAt: {
      type: Date,
    },
    paymentDescription: {
      type: String,
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
