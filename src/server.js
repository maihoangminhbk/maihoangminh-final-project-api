import express from 'express'
import { connectDB } from '*/config/mongodb'
import { env } from '*/config/environment'

const app = express()

const hostname = env.HOST
const port = env.PORT

connectDB().catch(console.log)

app.get('/', (req, res) => {
  res.end('<h1>Hello world</h1><hr/>')
})

app.listen(port, hostname, () => {
  // eslint-disable-next-line no-console
  console.log(`Hello Minh Mai, Iam running at ${hostname}:${port}/`)
})