import asyncHandler from 'express-async-handler'
import axios from 'axios'
import moment from 'moment'
import User from '../models/userModel.js'
import Transaction from '../models/transactionModel.js'

// @desc    welcom to mpesa api
// @route   GET /api/orders
// @access  Public
const welcome = asyncHandler(async (req, res) => {
  res.send(' The Mpesa API is running....')
})

// @desc    Getting the access token
// @route   GET /api/access_token
// @access  Private
const access_token = asyncHandler(async (req, res) => {
  res.status(200).json({ access_token: req.token })
})

// @desc    Initiating STK PUSH
// @route   POST /api/lipa_na_mpesa
// @access  Private

const stkpush = asyncHandler(async (req, res) => {
  const token = req.token
  const auth = `Bearer ${token}`

  const timestamp = moment().format('YYYYMMDDHHmmss')

  const mobile = req.query.phone
  const pay = req.query.amount
  const id = req.query.id
  const subscription = req.query.subscription

  const url = process.env.LIPA_NA_MPESA_URL
  const BusinessShortCode = process.env.SHORT_CODE
  const key = 'd71137a7d22fbb56c7c273658cd8d3e4446ca6da7a21dbcfd077a1dcb98735cd'
  // const key = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'

  const password = new Buffer.from(
    `${BusinessShortCode}${key}${timestamp}`
  ).toString('base64')

  const transcation_type = 'CustomerPayBillOnline'
  const amount = pay //you can enter any amount
  const partyA = mobile //should follow the format:2547xxxxxxxx
  const partyB = process.env.SHORT_CODE
  const phoneNumber = mobile
  const callBackUrl = `https://tru-cv-backend.onrender.com/api/mpesa/stk_callback?id=${id}&subscription=${subscription}`
  const accountReference = 'Subscription of TruCv by Twenifo Technologies'
  const transaction_desc = 'TruCv by Twenifo Technologies'

  try {
    const response = await axios.post(
      url,
      {
        BusinessShortCode: BusinessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transcation_type,
        Amount: amount,
        PartyA: partyA,
        PartyB: partyB,
        PhoneNumber: phoneNumber,
        CallBackURL: callBackUrl,
        AccountReference: accountReference,
        TransactionDesc: transaction_desc,
      },
      {
        headers: {
          Authorization: auth,
        },
      }
    )

    // save transaction to mongo db

    const transaction_doc = new Transaction({
      user: id,
      mechant_request_id: response.data.MerchantRequestID,
    })

    const transaction_callback = await transaction_doc.save()

    console.log(transaction_callback)
    return res.json({
      transaction: response.data.ResponseDescription,
    })
  } catch (err) {
    console.error(err)
    return res.status(err.response.status).json({ error: err.response.data })
  }
})

const lipaNaMpesaOnlineCallback = asyncHandler(async (req, res) => {
  //Get the transaction description

  const id = req.query.id
  const credit_name = req.query.subscription

  const { MerchantRequestID, ResultCode, ResultDesc, CallbackMetadata } =
    req.body.Body.stkCallback

  const updateObject = {
    result_code: ResultCode,
    result_desc: ResultDesc,
  }
  if (CallbackMetadata) {
    updateObject.callback_metadata = CallbackMetadata
  }

  // Update transaction with matching mechant_request_id

  try {
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { mechant_request_id: MerchantRequestID },
      updateObject,
      { new: true, upsert: true }
    )
    console.log(updatedTransaction)
  } catch (err) {
    console.log(err)
  }

  // Pay as you go entitlements object

  const creditsData = {
    50: {
      'cv builder': 3,
      'cv review': 1,
      'cv sample downloads': 2,
    },
    100: {
      'cv builder': 5,
      'cv review': 3,
      'cv sample downloads': 4,
      'cv subscription': 100,
    },
    200: {
      'cv builder': 10,
      'cv review': 7,
      'cv sample downloads': 8,
    },
    1000: {
      'cv subscription': 1000,
    },
  }

  // checking the amount and credit name and return credits value then update user field

  if (ResultCode === 0) {
    const amount = CallbackMetadata.Item.find((i) => i.Name === 'Amount').Value

    let credits = creditsData[amount]
      ? creditsData[amount][credit_name]
      : undefined

    try {
      if (credit_name === 'subscription') {
        let end_date
        if (amount === '100') {
          end_date = new Date()
          end_date.setDate(end_date.getDate() + 30)
        } else if (amount === '1000') {
          end_date = new Date()
          end_date.setMonth(end_date.getMonth() + 12)
        }
        const updatedUser = await User.findOneAndUpdate(
          { _id: user_id },
          { subscription_end_date: end_date, subscription: 'SUBSCRIPTION' },
          { new: true, upsert: true }
        )
        console.log(updatedUser)
      } else {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user_id },
          { plan: credit_name, credit: credits, subscription: 'PAYG' },
          { new: true, upsert: true }
        )
        console.log(updatedUser)
      }
    } catch (err) {
      console.log(err)
    }
  } else {
    console.log(`Transaction failed: ${ResultDesc}`)
  }

  return res.send({
    success: true,
  })
})

// @desc    Get logged in user transaction
// @route   GET /api/transactions/mytransactions
// @access  Private

const getTransaction = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id })
  res.json(transactions)
})

export {
  welcome,
  access_token,
  stkpush,
  lipaNaMpesaOnlineCallback,
  getTransaction,
}
