import nodemailer from 'nodemailer'
import HTML_TEMPLATE from './mail-template.js'

import { env } from '../config/environment'

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: env.MAILER_USER,
    pass: env.MAILER_PASSWORD
  }
})

export const setOptions = (subject, content, describe, receiver) => {
  const options = {
    from: `Minh <${env.MAILER_USER}>`, // sender address
    to: receiver, // receiver email
    subject: subject, // Subject line
    text: content,
    html: HTML_TEMPLATE(content, describe)
  }
  return options
}

/** create reusable sendmail function
@params {object} options - mail options (to, subject, text, html)
@params {function} callback - callback function to handle response
*/
const SENDMAIL = async (mailDetails, callback) => {
  try {
    const info = await transporter.sendMail(mailDetails)
    callback(info)
  } catch (error) {
    console.log(error)
  }
}

export default SENDMAIL