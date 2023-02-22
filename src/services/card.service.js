import { CardModel } from '*/models/card.model'
import { ColumnModel } from '*/models/column.model'
import busboy from 'busboy'

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Upload } from '@aws-sdk/lib-storage'


const createNew = async (data) => {
  try {
    const result = await CardModel.createNew(data)
    const newCardId = result.insertedId


    const newCard = await CardModel.getOneById(newCardId)
    // Push card id to card order in column collection
    const columnId = newCard.columnId
    await ColumnModel.pushCardOrder(columnId, newCardId)

    return newCard
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: Date.now()
    }

    if (updateData._id) delete updateData._id

    const updatedCard = await CardModel.update(id, updateData)

    return updatedCard
  } catch (error) {
    throw new Error(error)
  }
}

const uploadImage = async (req, res) => {
  try {
    console.log('Vao')
    const bb = busboy( { headers: req.headers })
    bb.on('file', async (name, file, info) => {
      const { filename, encoding, mimeType } = info


      const client = new S3Client({
        region: 'ap-southeast-1'
      })

      const params = {
        Bucket: 'trello-image-server',
        Key: filename,
        Body: file
      }

      try {
        const parallelUploads3 = new Upload({
          client: client,
          // tags: [...], // optional tags
          queueSize: 4, // optional concurrency configuration
          leavePartsOnError: false, // optional manually handle dropped parts
          params: params
        })

        parallelUploads3.on('httpUploadProgress', (progress) => {
          console.log('progress', progress)
        })

        await parallelUploads3.done()

        console.log('parallelUploads3', parallelUploads3)
        console.log('location', parallelUploads3.singleUploadResult.Location)

        const { id } = req.params
        const location = parallelUploads3.singleUploadResult.Location

        const getObjectParams = {
          Bucket: 'trello-image-server',
          Key: filename
        }

        const command = new GetObjectCommand(getObjectParams)
        const url = await getSignedUrl(client, command, { expiresIn: 3600 })

        const updateData = {
          cover: url
        }
        await update(id, updateData)

        return url
      } catch (e) {
        console.log(e)
      }
    })

    bb.on('close', () => {
      console.log('Done parsing form!')
      // res.writeHead(303, { Connection: 'close', Location: '/' })
      // res.end()
    })
    req.pipe(bb)
  } catch (error) {
    throw new Error(error)
  }
}

export const CardService = {
  createNew,
  update,
  uploadImage
}