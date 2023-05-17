import { Server } from 'socket.io'
import http from 'http'
import { env } from '*/config/environment'

const socketHost = env.SOCKET_HOST

const server = http.createServer()

server.listen(5551, socketHost)

export const io = new Server(server, {
  cors: {
    origin: 'https://localhost:3000'
  }
})

