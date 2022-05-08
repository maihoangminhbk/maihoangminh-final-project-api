import { MongoClient } from 'mongodb'
import { env } from '*/config/environment'



export const connectDB = async () => {
  const client = new MongoClient(env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewURLParser: true
  })

  try {
    //  Connect client to server
    await client.connect()
    console.log('Connection successful to server')

    // List databases
    await listDatabases(client)

  } finally {
    // Ensure client will close
    await client.close()
  }
}

const listDatabases = async (client) => {
  const databaseList = await client.db().admin().listDatabases()

  console.log('My databases:')

  databaseList.databases.forEach(db => {
    console.log(`- ${db.name}`)
  })
}