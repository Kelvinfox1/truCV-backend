import path from 'path'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import colors from 'colors'
import morgan from 'morgan'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import axios from 'axios'
import userRoutes from './routes/userRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'

dotenv.config()

const app = express()
var routerMPESA = express.Router()

app.use(cors())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(express.json())

/* app.get('/stk-push', function (req, res) {
  res.send('Hello World!');
  doStkPush(254700377117, 2, '3AXqe6FjpVobh8RRYmQ1Iz8flTd9');
}); */

app.get('/mpsa', async (req, res) => {
  //Replace these details with the correct ones
  let consumer_key = 'rd8vt7u7211C8ilQM2BJ3Emob5V13yRU'
  let consumer_secret = 'VK3pTwqlGS7ZrBoF'

  let url =
    'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
  let b = Buffer.from(consumer_key + ':' + consumer_secret).toString('base64')

  let auth = `Basic ${b}`

  try {
    let { data } = await axios.get(url, {
      headers: {
        Authorization: auth,
      },
    })
    console.log(data)
    return doStkPush(254724634854, 3, data.access_token)
  } catch (err) {
    return res.send(err)
  }
})

async function doStkPush(phone, amount, token) {
  console.log('Attempting STK push')
  let auth = `Bearer ${token}`
  let paybill = '4029319'

  //getting the timestamp
  let d = new Date()
  let timestamp =
    d.getFullYear() +
    (d.getMonth() + 1).toString().padStart(2, '0') +
    d.getDate().toString().padStart(2, '0') +
    d.getHours().toString().padStart(2, '0') +
    d.getMinutes().toString().padStart(2, '0') +
    d.getSeconds().toString().padStart(2, '0')

  let url = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
  let bs_short_code = paybill // Paybill number
  let passkey =
    '73e3efdde449aabacb6ac32344b1bc72e57ca4947c93d926e2911ddd102b8be3' // Provided by saf

  let password = Buffer.from(`${paybill}${passkey}${timestamp}`).toString(
    'base64'
  )
  let transcation_type = 'CustomerPayBillOnline'
  let partyA = phone //should follow the format: 2547xxxxxxxx
  let partyB = paybill
  let phoneNumber = phone //should follow the format: 2547xxxxxxxx
  let callBackUrl =
    'https://app.localkopo.com/api/api/v1/payment/mpesa/callback'
  let accountReference = 'account number' //
  let transaction_desc = 'Payment for services'

  try {
    let { data } = await axios.post(
      url,
      {
        BusinessShortCode: bs_short_code,
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

    console.log(data)
  } catch (err) {
    console.log(err)
  }
}

app.get('/', (req, res) => {
  res.send('API is running!!!')
})

app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes)

const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))
app.use(routerMPESA)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue.bold
  )
)
