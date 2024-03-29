import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    subscription: {
      type: String,
      enum: ['PAYG', 'SUBSCRIPTION'],
      default: 'PAYG',
    },
    subscription_end_date: {
      type: Date,
    },
    transaction_history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],

    isSubscribed: {
      type: Boolean,
      default: false,
    },
    endDate: { type: Date, default: null },

    plan: {
      type: String,
      enum: ['none', 'cv builder', 'cv review', 'cv sample downloads'],
      default: 'none',
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      paidAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
)

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compareSync(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSaltSync(10)
  this.password = await bcrypt.hashSync(this.password, salt)
})

const User = mongoose.model('User', userSchema)

export default User
