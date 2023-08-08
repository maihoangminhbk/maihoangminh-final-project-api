import { TaskModel } from '*/models/task.model'
import { CardModel } from '*/models/card.model'
import { UserModel } from '*/models/user.model'
import { BoardModel } from '*/models/board.model'

import { NotificationService } from '*/services/notification.service'
import { OwnershipService } from '*/services/ownership.service'

import { NotPermission403Error, BadRequest400Error, Conflict409Error } from '../ultilities/errorsHandle/APIErrors'

const createNew = async (data) => {
  try {
    const { cardId, userId } = data
    const card = await CardModel.getCard(cardId)

    if (!card) {
      throw new BadRequest400Error('Can not find card Id')
    }

    data.workplaceId = card.workplaceId.toString()
    data.boardId = card.boardId.toString()

    const board = await BoardModel.getOneById(data.boardId)

    if (!board) {
      throw new BadRequest400Error('Can not find this board')
    }

    const result = await TaskModel.createNew(data)

    const newTaskId = result.insertedId

    const insertData = {
      userId: userId
      // role: role
    }

    await TaskModel.addUser(newTaskId.toString(), insertData)

    await OwnershipService.pushTaskOrder(userId, newTaskId.toString())

    const notificationData = {
      workplaceId: card.workplaceId.toString(),
      boardId: card.boardId.toString(),
      boardTitle: board.title,
      notificationType: 'board',
      userCreateId: data.userId,
      action: 'created',
      userTargetId: null,
      objectTargetType: 'task',
      objectTargetId: newTaskId.toString()
    }

    await NotificationService.createNew(notificationData)

    const newTask = await TaskModel.getOneById(newTaskId)
    // Push task id to task order in card collection
    // const cardId = newTask.cardId.toString()
    // await CardModel.pushCardOrder(cardId, newTaskId.toString())


    return newTask
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (req) => {
  try {
    const { id, userId } = req.params

    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    }

    if (updateData._id) delete updateData._id
    if (updateData.users) delete updateData.users

    const updatedTask = await TaskModel.update(id, updateData)

    if (updateData._destroy) {
      await OwnershipService.popTaskOrder('', updatedTask._id.toString())
    }

    const board = await BoardModel.getOneById(updatedTask.boardId.toString())

    if (!board) {
      throw new BadRequest400Error('Can not find this board')
    }

    let notificationData

    if (userId !== updatedTask.userId.toString()) {
      notificationData = {
        workplaceId: updatedTask.workplaceId.toString(),
        boardId: updatedTask.boardId.toString(),
        boardTitle: board.title,
        notificationType: 'personal',
        userCreateId: userId,
        action: 'updated',
        userTargetId: updatedTask.userId.toString(),
        objectTargetType: 'task',
        objectTargetId: updatedTask._id.toString()
      }
    } else {
      notificationData = {
        workplaceId: updatedTask.workplaceId.toString(),
        boardId: updatedTask.boardId.toString(),
        boardTitle: board.title,
        notificationType: 'board',
        userCreateId: userId,
        action: 'updated',
        userTargetId: null,
        objectTargetType: 'task',
        objectTargetId: updatedTask._id.toString()
      }
    }

    await NotificationService.createNew(notificationData)


    return updatedTask
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

const getCardId = async (taskId) => {
  try {
    const cardId = await TaskModel.getCardId(taskId)
    return cardId
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

const addUser = async (req) => {
  const { id, userId } = req.params
  const { email } = req.body

  const task = await TaskModel.getTask(id)

  if (!task) {
    throw new NotPermission403Error('Task not exist')
  }

  const userAdded = await UserModel.getOneByEmail(email)

  if (!userAdded) {
    throw new BadRequest400Error('User with email not exist')
  }

  const isUserExist = await TaskModel.checkUserExist(id, userAdded._id.toString())


  if (isUserExist) {
    throw new Conflict409Error('User permission exist in task')
  }

  const board = await BoardModel.getOneById(task.boardId.toString())

  if (!board) {
    throw new BadRequest400Error('Can not find this board')
  }


  // await CardService.addUser(userAdded._id.toString(), task.cardId.toString())


  const insertData = {
    userId: userAdded._id.toString()
    // role: role
  }

  const result = await TaskModel.addUser(id, insertData)

  await OwnershipService.pushTaskOrder(userAdded._id.toString(), id)

  const notificationData = {
    workplaceId: task.workplaceId.toString(),
    boardId: task.boardId.toString(),
    boardTitle: board.title,
    notificationType: 'personal',
    userCreateId: userId,
    action: 'added',
    userTargetId: userAdded._id.toString(),
    objectTargetType: 'task',
    objectTargetId: task._id.toString()
  }

  await NotificationService.createNew(notificationData)

  return result
}

const searchUsers = async (req) => {
  const { id } = req.params
  const { keyword, page } = req.body

  const task = await getTask(id)

  if (!task) {
    throw new BadRequest400Error('Can not find task Id')
  }

  const users = await TaskModel.searchUsers(id, keyword, page)

  return users
}

const searchUsersToAdd = async (req) => {
  const { id, userId } = req.params
  const { keyword, page } = req.body

  const task = await getTask(id)

  if (!task) {
    throw new BadRequest400Error('Can not find task Id')
  }

  if (!keyword) {
    return []
  }

  const cardId = task.cardId.toString()


  const users = await UserModel.searchUsersToAddTask(cardId, id, keyword, page)

  return users
}

const deleteUser = async (req) => {
  const { id, userId } = req.params
  const { email } = req.body

  const task = await getTask(id)

  if (!task) {
    throw new BadRequest400Error('Can not find task Id')
  }

  const userAdded = await UserModel.getOneByEmail(email)

  if (!userAdded) {
    throw new BadRequest400Error('User with email not exist')
  }

  const isUserExistInTask = await TaskModel.checkUserExist(id, userAdded._id.toString())


  if (!isUserExistInTask) {
    throw new BadRequest400Error('User not exist in task')
  }

  await OwnershipService.popTaskOrder(userAdded._id.toString(), id)

  const result = await TaskModel.deleteUser(id, userAdded._id.toString())

  return result
}

const getTasksStatusStatistic = async (boardId, startTime, endTime) => {
  const result = await TaskModel.getTasksStatusStatistic(boardId, startTime, endTime)

  return result
}

const getTasksStatusFullStatistic = async (workplaceId) => {

  const result = await TaskModel.getTasksStatusFullStatistic(workplaceId)

  return result
}

const getTaskCount = async (workplaceId) => {
  try {
    return await TaskModel.getTaskCount(workplaceId)
  } catch (error) {
    throw new Error(error)
  }

}

const getTaskCountFromBoard = async (boardId) => {
  try {
    return await TaskModel.getTaskCountFromBoard(boardId)
  } catch (error) {
    throw new Error(error)
  }

}

const getTasksStatusInYearStatistic = async (boardId, year) => {
  try {
    let validatedYear = year

    if (!validatedYear) {
      validatedYear = new Date().getFullYear()
    }

    return await TaskModel.getTasksStatusInYearStatistic(boardId, validatedYear)
  } catch (error) {
    throw new Error(error)
  }

}

export const TaskService = {
  createNew,
  update,
  // uploadImage,
  // getImageUrl
  getCardId,
  addUser,
  searchUsers,
  searchUsersToAdd,
  deleteUser,
  getTasksStatusStatistic,
  getTaskCount,
  getTasksStatusFullStatistic,
  getTasksStatusInYearStatistic,
  getTaskCountFromBoard
}