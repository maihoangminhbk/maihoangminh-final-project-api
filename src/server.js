import express from 'express'
import cors from 'cors'
import { corsOptions } from '*/config/cors'
import { connectDB } from '*/config/mongodb'
import { env } from '*/config/environment'
import { apiV1 } from '*/routes/v1'
import { BoardModel } from '*/models/board.model'

import { Server } from 'socket.io'
import http from 'http'

const hostname = env.APP_HOST
const port = env.APP_PORT

connectDB()
  .then(() => console.log('Connected successfully!'))
  .then(() => bootServer())
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

const bootServer = () => {
  const app = express()

  app.use(cors(corsOptions))

  // Enable request body
  app.use(express.json())

  // Use APIs v1
  app.use('/v1', apiV1)

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/test.html')
  })

  const server = http.createServer(app)

  server.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello, Iam running at ${hostname}:${port}/`)
  })

  const io = new Server(server,  {
    cors: {
      origin: 'http://localhost:3000'
    }
  })

  io.of('/v1/board').on('connection', (socket) => {
    console.log('a user connected to board socket server', socket.id)

    socket.on('onColumnDrop', (arg) => {
      console.log(arg)
      socket.broadcast.emit('onColumnChange', arg)
    })

    socket.on('onColumnAdd', (arg) => {
      console.log(arg)
      socket.broadcast.emit('onColumnAdd', arg)
    })

    socket.on('onColumnUpdateState', (arg) => {
      console.log(arg)
      socket.broadcast.emit('onColumnUpdateState', arg)
    })

    socket.on('onCardDrop', (columnId, dropResult) => {
      console.log(columnId, dropResult)
      socket.broadcast.emit('onCardDrop', columnId, dropResult)
    })

    socket.on('disconnect', (reason) => {
      console.log('reason', reason)
    })

  })

  io.listen(5551)
}
