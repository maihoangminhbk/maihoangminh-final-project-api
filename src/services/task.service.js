import { TaskModel } from '*/models/task.model'
import { CardModel } from '*/models/card.model'
import busboy from 'busboy'
import randomImageName from '../ultilities/randomImageName'

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Upload } from '@aws-sdk/lib-storage'
import { HttpStatusCode } from '*/ultilities/constants'


const createNew = async (data) => {
  try {
    const result = await TaskModel.createNew(data)
    const newTaskId = result.insertedId

    const newTask = await TaskModel.getOneById(newTaskId)
    // Push task id to task order in card collection
    // const cardId = newTask.cardId.toString()
    // await CardModel.pushCardOrder(cardId, newTaskId.toString())
    return newTask
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

const getTask = async (taskId) => {
  try {
    const task = await TaskModel.getTask(taskId)

    if (!task) {
      throw new Error('Task not found!')
    }


    return task
  } catch (error) {
    throw new Error(error)
  }
}

// const uploadImage = async (req, res) => {
//   try {

//     const bb = busboy( { headers: req.headers })
//     await bb.on('file', async (name, file, info) => {
//       const { filename, encoding, mimeType } = info

//       const client = new S3Client({
//         region: 'ap-southeast-1'
//       })
//       const imageName = randomImageName()

//       const params = {
//         Bucket: 'trello-image-server',
//         Key: imageName,
//         Body: file
//       }

//       try {
//         const parallelUploads3 = new Upload({
//           client: client,
//           // tags: [...], // optional tags
//           queueSize: 4, // optional concurrency configuration
//           leavePartsOnError: false, // optional manually handle dropped parts
//           params: params
//         })

//         parallelUploads3.on('httpUploadProgress', (progress) => {
//           console.log('progress', progress)
//         })

//         await parallelUploads3.done()

//         const { id } = req.params
//         const card = await getCard(id)

//         if (card.cover) {
//           deleteImage(card.cover)
//         }


//         const url = await getImageUrl(imageName)

//         const updateData = {
//           cover: imageName
//         }


//         await update(id, updateData)

//         const returnData = {
//           url: url
//         }


//         res.status(HttpStatusCode.OK).json(returnData)
//         return returnData
//       } catch (e) {
//         console.log(e)
//       }
//     })

//     bb.on('close', () => {
//       const returnData = {
//         url: 'test'
//       }
//       console.log('Done parsing form!')
//       // res.status(501).json(returnData)
//       // res.writeHead(303, { Connection: 'close', Location: '/' })
//       // res.end()
//     })
//     req.pipe(bb)
//   } catch (error) {
//     throw new Error(error)
//   }
// }

// const getImageUrl = async (imageName) => {
//   try {

//     if (!imageName) return ''

//     const client = new S3Client({
//       region: 'ap-southeast-1'
//     })

//     const getObjectParams = {
//       Bucket: 'trello-image-server',
//       Key: imageName
//     }

//     const command = new GetObjectCommand(getObjectParams)
//     const url = await getSignedUrl(client, command, { expiresIn: 36000 }).catch((error) => {
//       console.log(error)
//     })


//     return url
//   } catch (error) {
//     console.log('error', error)
//   }

// }

// const deleteImage = async (imageName) => {
//   if (!imageName) return

//   const client = new S3Client({
//     region: 'ap-southeast-1'
//   })

//   const getObjectParams = {
//     Bucket: 'trello-image-server',
//     Key: imageName
//   }

//   const command = new DeleteObjectCommand(getObjectParams)
//   try {
//     client.send(command)
//   }
//   catch (error) {
//     console.log('error', error)
//   }
// }

export const TaskService = {
  createNew,
  update
  // uploadImage,
  // getImageUrl
}