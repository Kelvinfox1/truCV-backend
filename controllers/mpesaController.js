import asyncHandler from 'express-async-handler'
import axios from 'axios'
import moment from 'moment'
import Subscription from '../models/subscriptionModel.js'
import User from '../models/userModel.js'

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
// @route   POST /api/access_token
// @access  Private

const stkpush = asyncHandler(async (req, res) => {
  const token = req.token
  const auth = `Bearer ${token}`
  const timestamp = moment().format('YYYYMMDDHHmmss')
  const x = req.query.phone
  const mobile = req.query.phone
  const email = req.query.email
  const pay = req.query.amount

  console.log('phone', x)

  const url = process.env.LIPA_NA_MPESA_URL
  const BusinessShortCode = process.env.SHORT_CODE
  const key = 'd71137a7d22fbb56c7c273658cd8d3e4446ca6da7a21dbcfd077a1dcb98735cd'

  const password = new Buffer.from(
    `${BusinessShortCode}${key}${timestamp}`
  ).toString('base64')

  const transcation_type = 'CustomerPayBillOnline'
  const amount = pay //you can enter any amount
  const partyA = mobile //should follow the format:2547xxxxxxxx
  const partyB = process.env.SHORT_CODE
  const phoneNumber = mobile
  const callBackUrl = `https://tru-cv-backend.herokuapp.com/api/mpesa/stk_callback?email=${email}`
  const accountReference = 'Subscription of TruCv by Twenifo Technologies'
  const transaction_desc = 'TruCv by Twenifo Technologies'

  try {
    let { data } = await axios
      .post(
        url,
        {
          BusinessShortCode: BusinessShortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: transcation_type,
          Amount: '1',
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
      .catch(console.log)

    return res.send({
      success: true,
      message: data,
    })
  } catch (err) {
    res.status(404)
    throw new Error(err)
  }
})

const lipaNaMpesaOnlineCallback = asyncHandler(async (req, res) => {
  //Get the transaction description
  let message = req.body.Body
  let description = message.stkCallback['ResultDesc']

  let check = message.stkCallback['ResultCode']

  console.log('reciept', message)
  console.log('result', message.stkCallback['ResultDesc'])

  const email = req.query.email

  const subscription = new Subscription({
    email: email,
    paidAt: Date.now(),
    paymentDescription: description,
    paymentResult: message,
  })

  const createSubscription = await subscription.save()

  const filter = { email: email }
  const update = { isSubscribed: true }

  if (check === 0) {
    let doc = await User.findByIdAndUpdate(filter, update)

    doc = await User.findOne(filter)
    doc.isSubscribed
  }

  console.log(createSubscription)

  return res.send({
    success: true,
    message: message,
  })
})

export { welcome, access_token, stkpush, lipaNaMpesaOnlineCallback }
