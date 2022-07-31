import express from 'express'
import cors from 'cors'
import { corsOptions } from '*/config/cors'
import { connectDB } from '*/config/mongodb'
import { env } from '*/config/environment'
import { apiV1 } from '*/routes/v1'
import { BoardModel } from '*/models/board.model'


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

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello Minh Mai, Iam running at ${hostname}:${port}/`)
  })
}