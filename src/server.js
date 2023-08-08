import express from 'express'
import cookieParser from 'cookie-parser'
import sessions from 'express-session'
import session from 'express-session'

import cors from 'cors'
import { corsOptions } from '*/config/cors'
import { connectDB } from '*/config/mongodb'
import { env } from '*/config/environment'
import { apiV1 } from '*/routes/v1'
import { BoardModel } from '*/models/board.model'

import { io } from '*/socket/socketServer'
import boardConnection from '*/socket/workplaces/board.workplace/boardConnection'
import chatbotConnection from '*/socket/workplaces/chatbot.workplace/chatbotConnection'

import fs from 'fs'
import https from 'https'
import { WebClient } from '@slack/web-api'

import { checkDeadline } from './ultilities/cronDeadline'


const hostname = env.APP_HOST
// const port = env.PORT
const port = env.PORT || 80
const socketHost = env.SOCKET_HOST
const sessionSecret = env.SESSION_SECRET

connectDB()
  .then(() => console.log('Connected successfully!'))
  .then(() => bootServer())
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

const credentials = {
  key: fs.readFileSync('./.cert/key.pem'),
  cert: fs.readFileSync('./.cert/cert.pem')
}

const bootServer = () => {
  const app = express()

  app.use(cors(corsOptions))

  // Enable request body
  app.use(express.json())

  app.get('/', (req, res) => {
    res.send('Hello World ' + Date.now())
  })

  // Enable session
  // app.use(session({
  //   secret: sessionSecret,
  //   saveUninitialized:true,
  //   cookie: { maxAge: 3600, httpOnly: false },
  //   resave: true
  // }))

  // Enable cookie
  // app.use(cookieParser())

  // Use APIs v1
  app.use('/v1', apiV1)

  // app.listen(port,
  //   // hostname,
  //   () => {
  //   // eslint-disable-next-line no-console
  //     console.log(`Hello, Iam running at ${hostname}:${port}/`)
  //   })

  // Socket server
  io.of('/v1/board').on('connection', boardConnection)
  io.of('/v1/chatbot').on('connection', chatbotConnection)

  // check deadline by cron
  checkDeadline()

  const httpsServer = https.createServer(credentials, app)
  httpsServer.listen(port, () => console.log(`Your Slack-OAuth app is listening on port ${port}.`))
}
