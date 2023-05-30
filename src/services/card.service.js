import { CardModel } from '*/models/card.model'
import { ColumnModel } from '*/models/column.model'
import { UserModel } from '*/models/user.model'

import { OwnershipService } from './ownership.service'
import { NotificationService } from '*/services/notification.service'

import busboy from 'busboy'
import randomImageName from '../ultilities/randomImageName'

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Upload } from '@aws-sdk/lib-storage'
import { HttpStatusCode } from '*/ultilities/constants'

import { NotPermission403Error, BadRequest400Error, Conflict409Error } from '../ultilities/errorsHandle/APIErrors'


const createNew = async (data) => {
  try {
    const result = await CardModel.createNew(data)
    const newCardId = result.insertedId


    const newCard = await CardModel.getOneById(newCardId)
    // Push card id to card order in column collection
    const columnId = newCard.columnId.toString()
    await ColumnModel.pushCardOrder(columnId, newCardId.toString())
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

const getCard = async (cardId) => {
  try {
    const card = await CardModel.getCard(cardId)

    if (!card) {
      throw new Error('Card not found!')
    }


    return card
  } catch (error) {
    throw new Error(error)
  }
}

const uploadImage = async (req, res) => {
  try {

    const bb = busboy( { headers: req.headers })
    await bb.on('file', async (name, file, info) => {
      const { filename, encoding, mimeType } = info

      const client = new S3Client({
        region: 'ap-southeast-1'
      })
      const imageName = randomImageName()

      const params = {
        Bucket: 'trello-image-server',
        Key: imageName,
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

        const { id } = req.params
        const card = await getCard(id)

        if (card.cover) {
          deleteImage(card.cover)
        }


        const url = await getImageUrl(imageName)

        const updateData = {
          cover: imageName
        }


        await update(id, updateData)

        const returnData = {
          url: url
        }


        res.status(HttpStatusCode.OK).json(returnData)
        return returnData
      } catch (e) {
        console.log(e)
      }
    })

    bb.on('close', () => {
      const returnData = {
        url: 'test'
      }
      console.log('Done parsing form!')
      // res.status(501).json(returnData)
      // res.writeHead(303, { Connection: 'close', Location: '/' })
      // res.end()
    })
    req.pipe(bb)
  } catch (error) {
    throw new Error(error)
  }
}

const getImageUrl = async (imageName) => {
  try {

    if (!imageName) return ''

    const client = new S3Client({
      region: 'ap-southeast-1'
    })

    const getObjectParams = {
      Bucket: 'trello-image-server',
      Key: imageName
    }

    const command = new GetObjectCommand(getObjectParams)
    const url = await getSignedUrl(client, command, { expiresIn: 36000 }).catch((error) => {
      console.log(error)
    })


    return url
  } catch (error) {
    console.log('error', error)
  }

}

const deleteImage = async (imageName) => {
  if (!imageName) return

  const client = new S3Client({
    region: 'ap-southeast-1'
  })

  const getObjectParams = {
    Bucket: 'trello-image-server',
    Key: imageName
  }

  const command = new DeleteObjectCommand(getObjectParams)
  try {
    client.send(command)
  }
  catch (error) {
    console.log('error', error)
  }
}

const getBoardId = async (cardId) => {
  try {
    const result = await CardModel.getBoardId(cardId)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const addUser = async (userId, cardId) => {

  // const board = await BoardModel.getOneByOwnerAndId(id, userId)

  // if (!board) {
  //   throw new NotPermission403Error('User not owner board')
  // }

  await OwnershipService.pushCardOrder(userId, cardId)

  const insertData = {
    userId: userId
  }

  const result = await CardModel.addUser(cardId, insertData)

  return result
}

export const CardService = {
  createNew,
  update,
  uploadImage,
  getImageUrl,
  getBoardId,
  getCard,
  addUser
}