import { CardModel } from '*/models/card.model'
import { ColumnModel } from '*/models/column.model'
import { UserModel } from '*/models/user.model'
import { BoardModel } from '*/models/board.model'

import { OwnershipService } from './ownership.service'
import { WorkplaceService } from './workplace.service'
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
    const { boardId, columnId } = data

    const board = await BoardModel.getOneById(boardId)

    if (!board) {
      throw new BadRequest400Error('Can not find this board')
    }

    const column = await ColumnModel.getColumn(columnId)

    if (!column || column.boardId.toString() !== board._id.toString()) {
      throw new BadRequest400Error('Can not find this column in board')
    }

    // Add workplaceId to data
    data.workplaceId = board.workplaceId.toString()

    const result = await CardModel.createNew(data)
    const newCardId = result.insertedId

    const newCard = await CardModel.getOneById(newCardId)
    // Push card id to card order in column collection
    // const columnId = newCard.columnId.toString()
    await ColumnModel.pushCardOrder(columnId, newCardId.toString())

    await OwnershipService.pushCardOrder(data.userId, newCard._id.toString())

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
    if (updateData.users) delete updateData.users

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

const addUser = async (req) => {
  const { id } = req.params
  const { email } = req.body

  const card = await getCard(id)

  if (!card) {
    throw new BadRequest400Error('Can not find card Id')
  }

  const userAdded = await UserModel.getOneByEmail(email)

  if (!userAdded) {
    throw new BadRequest400Error('User with email not exist')
  }

  const checkBoardUser = await OwnershipService.checkBoardUser(card.boardId.toString(), userAdded._id.toString())

  if (!checkBoardUser) {
    throw new NotPermission403Error('Added User not in board')
  }

  await OwnershipService.pushCardOrder(userAdded._id.toString(), id)

  const insertData = {
    userId: userAdded._id.toString()
  }

  const result = await CardModel.addUser(id, insertData)

  return result
}

const searchUsers = async (req) => {
  const { id } = req.params
  const { keyword, page } = req.body

  const card = await getCard(id)

  if (!card) {
    throw new BadRequest400Error('Can not find card Id')
  }

  const users = await CardModel.searchUsers(id, keyword, page)

  return users
}

const searchUsersToAdd = async (req) => {
  const { id, userId } = req.params
  const { keyword, page } = req.body

  const card = await CardModel.getCard(id)

  if (!card) {
    throw new NotPermission403Error('User not owner card')
  }

  if (!keyword) {
    return []
  }

  const boardId = card.boardId.toString()


  const users = await UserModel.searchUsersToAddCard(boardId, id, keyword, page)

  return users
}

const deleteUser = async (req) => {
  const { id, userId } = req.params
  const { email } = req.body

  const card = await CardModel.getCard(id)

  if (!card) {
    throw new NotPermission403Error('User not owner card')
  }

  const userAdded = await UserModel.getOneByEmail(email)

  if (!userAdded) {
    throw new BadRequest400Error('User with email not exist')
  }

  const isUserExistInCard = await CardModel.checkUserExist(id, userAdded._id.toString())


  if (!isUserExistInCard) {
    throw new BadRequest400Error('User not exist in card')
  }

  await OwnershipService.popCardOrder(userAdded._id.toString(), id)

  const result = await CardModel.deleteUser(id, userAdded._id.toString())

  return result
}

const getCalendarCards = async (data) => {
  try {
    const { workplaceId, boardList } = data

    const workplace = await WorkplaceService.getWorkplace(workplaceId)
    if (!workplace) {
      throw new BadRequest400Error('Workplace not exist')
    }

    // console.log('workplace - boardorder', workplace.boardOrder)

    boardList.map(boardId => {
      let checkExist = 0
      workplace.boardOrder.map(board => {
        if (board.boardId.toString() === boardId) {
          checkExist = 1
        }
      })

      if (!checkExist) {
        throw new BadRequest400Error('Board in boardlist not exist in workplace')
      }
      // if (!workplace.boardOrder.includes(boardId)) {
      //   throw new BadRequest400Error('Board in boardlist not exist in workplace')
      // }
    })

    const result = await CardModel.getCalendarCards(data)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getCardCount = async (workplaceId) => {
  try {
    return await CardModel.getCardCount(workplaceId)
  } catch (error) {
    throw new Error(error)
  }

}

const getCardCountFromBoard = async (boardId) => {
  try {
    return await CardModel.getCardCountFromBoard(boardId)
  } catch (error) {
    throw new Error(error)
  }

}

const getCardsStatusStatistic = async (boardId, startTime, endTime) => {

  const result = await CardModel.getCardsStatusStatistic(boardId, startTime, endTime)

  return result
}

const getCardsStatusFullStatistic = async (workplaceId) => {

  const result = await CardModel.getCardsStatusFullStatistic(workplaceId)

  return result
}

export const CardService = {
  createNew,
  update,
  uploadImage,
  getImageUrl,
  getBoardId,
  getCard,
  addUser,
  getCalendarCards,
  searchUsers,
  searchUsersToAdd,
  deleteUser,
  getCardCount,
  getCardsStatusStatistic,
  getCardsStatusFullStatistic,
  getCardCountFromBoard
}