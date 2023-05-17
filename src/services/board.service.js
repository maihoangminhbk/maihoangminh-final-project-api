import { BoardModel } from '*/models/board.model'
import { UserModel } from '*/models/user.model'
import { cloneDeep } from 'lodash'
import { CardService } from '*/services/card.service'
import { WorkplaceService } from '*/services/workplace.service'
import { OwnershipService } from '*/services/ownership.service'
import { NotPermission403Error, BadRequest400Error, Conflict409Error } from '../ultilities/errorsHandle/APIErrors'

const createNew = async (data) => {
  try {
    const result = await BoardModel.createNew(data)

    const newBoardId = result.insertedId

    const newBoard = await BoardModel.getOneById(newBoardId)

    newBoard.columns = []

    await OwnershipService.pushBoardOrder(data.userId, newBoardId, 0, true)

    return newBoard
  } catch (error) {
    throw new Error(error)
  }
}

const getFullBoard = async (boardId) => {
  try {
    const board = await BoardModel.getFullBoard(boardId)
    // console.log('board', board)

    if (!board || !board.columns || !board.cards) {
      throw new Error('Board not found!')
    }

    const transformBoard = cloneDeep(board)
    // Filter deleted columns
    transformBoard.columns = transformBoard.columns.filter(column => !column._destroy)
    // Add card to each column
    // console.log('transformBoard 1', transformBoard)

    if (!transformBoard.columns || !transformBoard.columns.length) return transformBoard

    for (let column of transformBoard.columns) {
      column.cards = transformBoard.cards.filter(card => card.columnId.toString() === column._id.toString() && !card._destroy)
      if (!column.cards || !column.cards.length) continue
      for (let card of column.cards) {
        const url = await CardService.getImageUrl(card.cover)

        card.imageUrl = url
      }
    }

    // await column.cards.forEach(async card => {
    //   console.log('board service test')
    //   console.log('card.cover', card.cover)
    //   const url = await CardService.getImageUrl(card.cover).then(() => {
    //     card.imageUrl = url
    //   })
    //   console.log('card.imageUrl', card.imageUrl)

    // })

    // Remove cards from board
    delete transformBoard.cards

    // Sort column by column order, sort card by card order: This step will pass to front-end
    // console.log('transformBoard 2', transformBoard)

    return transformBoard
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
    if (updateData.columns) delete updateData.columns

    const updatedBoard = await BoardModel.update(id, updateData)

    return updatedBoard
  } catch (error) {
    throw new Error(error)
  }
}

const addUser = async (req) => {
  const { id, userId } = req.params
  const { email, role } = req.body

  const board = await BoardModel.getOneByOwnerAndId(id, userId)

  if (!board) {
    throw new NotPermission403Error('User not owner board')
  }

  const userAdded = await UserModel.getOneByEmail(email)

  if (!userAdded) {
    throw new BadRequest400Error('User with email not exist')
  }

  const isUserExist = await BoardModel.checkUserExist(id, userAdded._id.toString())


  if (isUserExist) {
    throw new Conflict409Error('User permission exist in board')
  }

  await OwnershipService.pushBoardOrder(userAdded._id.toString(), id, role, true)


  const insertData = {
    userId: userAdded._id.toString(),
    role: role
  }

  const result = await BoardModel.addUser(id, insertData)

  return result
}

const getUsers = async (req) => {
  const { id } = req.params
  const users = await BoardModel.getUsers(id)

  return users
}

export const BoardService = {
  createNew,
  getFullBoard,
  update,
  addUser,
  getUsers
}