import express from 'express'
import { connectDB } from '*/config/mongodb'
import { env } from '*/config/environment'
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

  app.get('/', async (req, res) => {
    let fakeData = {
      title: 'Minh Mai'
    }
    await BoardModel.createNew(fakeData)
    res.end('<h1>Hello world</h1><hr/>')
  })
   
  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello Minh Mai, Iam running at ${hostname}:${port}/`)
  })
}