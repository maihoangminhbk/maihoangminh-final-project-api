const message = 'Hi there, you were emailed me through nodemailer'
const receiver = 'maihoangminhbk@gmail.com'

import SENDMAIL, { setOptions } from './mailer.js'
// send mail with defined transport object and mail options
SENDMAIL(setOptions('Test', message, receiver), (info) => {
  console.log('Email sent successfully')
  console.log('MESSAGE ID: ', info.messageId)
})