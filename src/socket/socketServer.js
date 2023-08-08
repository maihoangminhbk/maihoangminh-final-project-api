import { Server } from 'socket.io'
import http from 'http'
import { env } from '*/config/environment'
import { WHITELIST_DOMAINS } from '*/ultilities/constants'


const socketHost = env.SOCKET_HOST

const server = http.createServer()

server.listen(8080)

export const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (WHITELIST_DOMAINS.indexOf(origin) !== -1 || !origin) {
        callback(null, true)
      } else {
        callback(new Error(`${origin} not allowed by CORS`))
      }
    }
  }
})

