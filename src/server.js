import express from 'express'
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

const hostname = env.APP_HOST
const port = env.APP_PORT
const socketHost = env.SOCKET_HOST

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

  // Use APIs v1
  app.use('/v1', apiV1)

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello, Iam running at ${hostname}:${port}/`)
  })

  // Socket server
  io.of('/v1/board').on('connection', boardConnection)
  io.of('/v1/chatbot').on('connection', chatbotConnection)

  // Https Server
  const client = new WebClient()

  app.get('/', (req, res) => {
    res.send('Successfully setup and running Node and Express.')
  })

  app.get('/auth/slack', async (_, res) => {
    const scopes = 'identity.basic,identity.email'
    const redirect_url = 'https://localhost:3443/auth/slack/callback'
    //Here you build the url. You could also copy and paste it from the Manage Distribution page of your app.
    // const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&user_scope=${scopes}&redirect_uri=${redirect_url}`
    const url = '<a href="https://slack.com/oauth/v2/authorize?client_id=2876650226691.5066786276325&scope=app_mentions:read,bookmarks:read,chat:write,channels:join,channels:read&user_scope=identity.email,identity.basic"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>'
    res.status(200)
      .header('Content-Type', 'text/html; charset=utf-8')
      .send(`
            <html><body>
            ${url}
            </body></html>
        `)
  })

  let token

  app.get('/auth/slack/callback', async (req, res) => {
    try {
      const response = await client.oauth.v2.access({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code: req.query.code
      })

      const identity = await client.users.identity({
        token: response.authed_user.access_token
      })

      token = response.access_token
      console.log('respond', response)
      console.log('identity', identity)

      // token = await JSON.stringify(identity)
      console.log('token', token)

      // await client.auth.test({ token })

      // At this point you can assume the user has logged in successfully with their account.
      res.status(200).send(`<html><body><p>You have successfully logged in with your slack account! Here are the details:</p><p>Response: ${JSON.stringify(response)}</p><p>Identity: ${JSON.stringify(identity)}</p></body></html>`)
    } catch (eek) {
      console.log(eek)
      res.status(500).send(`<html><body><p>Something went wrong!</p><p>${JSON.stringify(eek)}</p>`)
    }
  })

  app.get('/test', async (req, res) => {
    try {
      console.log('vao test', token)
      let result

      // Some fictitious database
      // const token = token

      // Call the method
      console.log('vao test', token)
      result = await client.auth.test({ token })
      console.log('result', result)


      res.send(result)
    } catch (error) {
      console.log(error)
    }
  })

  app.get('/post-message/:channel', async (req, res) => {
    try {
      const conversationId = req.params.channel


      // Post a message to the channel, and await the result.
      // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
      const result = await client.chat.postMessage({
        text: 'Hello world!',
        channel: conversationId,
        token: token
      })

      // The result contains an identifier for the message, `ts`.
      console.log(`Successfully send message ${result.ts} in conversation ${conversationId}`)


      res.send(`Successfully send message ${result.ts} in conversation ${conversationId}`)
    } catch (error) {
      console.log(error)
    }

  })

  app.get('/get-channels', async (req, res) => {
    try {
      // const conversationId = 'default-channel'


      // Post a message to the channel, and await the result.
      // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
      const response = await client.apiCall('conversations.list', {
        token: token
      })

      // The result contains an identifier for the message, `ts`.
      console.log(`Successfully send message ${response.ts} is: ${response}`)
      console.log('respond', response)

      res.send(response)
    } catch (error) {
      console.log(error)
    }

  })

  app.get('/join-channels', async (req, res) => {
    try {
      // const conversationId = 'default-channel'
      const channelId = 'C059U0Q09BK'

      // Post a message to the channel, and await the result.
      // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
      const response = await client.apiCall('conversations.join', {
        token: token,
        channel: channelId
      })

      // The result contains an identifier for the message, `ts`.
      console.log(`Successfully send message ${response.ts} is: ${response}`)
      console.log('respond', response)

      res.send(response)
    } catch (error) {
      console.log(error)
    }

  })

  const httpsServer = https.createServer(credentials, app)
  httpsServer.listen(3443, () => console.log('Your Slack-OAuth app is listening on port 3443.'))

}
