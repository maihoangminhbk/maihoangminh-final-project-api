import express from 'express'
import { mapOrder } from '*/ultilities/sorts.js'

const app = express()

const hostname = 'localhost'
const port = 5550

app.get('/', (req, res) => {
  res.end('<h1>Hello world</h1><hr/>')
})

app.listen(port, hostname, () => {
  // eslint-disable-next-line no-console
  console.log(`Hello Minh Mai, Iam running at ${hostname}:${port}/`)
})