import { MongoClient } from 'mongodb'
import { env } from '*/config/environment'

let dbInstance = null

export const connectDB = async () => {
  const client = new MongoClient(env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewURLParser: true
  })

  //  Connect client to server
  await client.connect()

  // Assign clientDB to dbInstance
  dbInstance = client.db(env.DATABASE_NAME)

}

export const getDB = () => {
  if (!dbInstance) throw new Error('Must connect to database first!')
  return dbInstance
}
