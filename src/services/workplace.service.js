import { WorkplaceModel } from '*/models/workplace.model'
import { BoardService } from '*/services/board.service'
import { OwnershipService } from '*/services/ownership.service'
import { BadRequest400Error, Conflict409Error, NotPermission403Error } from '../ultilities/errorsHandle/APIErrors'
import { UserModel } from '*/models/user.model'
// import { cloneDeep } from 'lodash'
const createNew = async (data) => {
  try {

    const result = await WorkplaceModel.createNew(data)

    const newWorkplaceId = result.insertedId

    // Add onwer to workplace
    const insertData = {
      userId: data.userId,
      role: 0
    }

    await WorkplaceModel.addUser(newWorkplaceId.toString(), insertData)


    // push workplace to ownership
    await OwnershipService.pushWorkplaceOrder(data.userId, newWorkplaceId.toString(), 0, true)

    // Create Board
    const boardData = {
      title: 'My board',
      workplaceId: newWorkplaceId.toString(),
      userId: data.userId
    }

    const createdBoard = await BoardService.createNew(boardData)


    boardData.boardId = createdBoard._id.toString()


    const updatedWorkplace = await pushBoardOrder(newWorkplaceId, boardData)

    const newWorkplace = await WorkplaceModel.getOneById(newWorkplaceId)

    return newWorkplace
  } catch (error) {
    throw new Error(error)
  }
}

const getWorkplace = async (workplaceId) => {
  try {
    const workplace = await WorkplaceModel.getOneById(workplaceId)

    if (!workplace) {
      throw new Error('Workplace not found!')
    }


    return workplace
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

    const updatedBoard = await WorkplaceModel.update(id, updateData)

    return updatedBoard
  } catch (error) {
    throw new Error(error)
  }
}

const pushBoardOrder = async (workplaceId, board) => {
  try {
    const result = await WorkplaceModel.pushBoardOrder(workplaceId, board)

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const addUser = async (req) => {
  const { id, userId } = req.params
  const { email, role } = req.body

  const workplace = await WorkplaceModel.getOneByOwnerAndId(id, userId)

  if (!workplace) {
    throw new NotPermission403Error('User not owner workplace')
  }

  const userAdded = await UserModel.getOneByEmail(email)

  if (!userAdded) {
    throw new BadRequest400Error('User with email not exist')
  }

  const isUserExist = await WorkplaceModel.checkUserExist(id, userAdded._id.toString())


  if (isUserExist) {
    throw new Conflict409Error('User permission exist in workplace')
  }

  if (userId === userAdded._id.toString()) {
    throw new Conflict409Error('Cannot add myseft to workplace')
  }

  await OwnershipService.pushWorkplaceOrder(userAdded._id.toString(), id, role, true)


  const insertData = {
    userId: userAdded._id.toString(),
    role: role
  }

  const result = await WorkplaceModel.addUser(id, insertData)

  return result
}

const getUsers = async (req) => {
  const { id, userId } = req.params

  const workplace = await WorkplaceModel.getOneByOwnerAndId(id, userId)

  if (!workplace) {
    throw new NotPermission403Error('User not owner workplace')
  }

  const users = await WorkplaceModel.getUsers(id)

  return users
}

const searchUsers = async (req) => {
  const { id, userId } = req.params
  const { keyword, page } = req.body

  const workplace = await WorkplaceModel.getOneById(id)

  if (!workplace) {
    throw new NotPermission403Error('User not owner workplace')
  }

  if (!keyword) {
    return []
  }

  const users = await UserModel.searchUsers(id, keyword, page)

  return users
}

const addBoard = async (workplaceId, data) => {
  const boardData = data

  const createdBoard = await BoardService.createNew(boardData)


  boardData.boardId = createdBoard._id.toString()


  const updatedWorkplace = await pushBoardOrder(workplaceId, boardData)

  const newWorkplace = await WorkplaceModel.getOneById(workplaceId)

  return newWorkplace
}

const checkUserExist = async (workplaceId, userId) => {
  return await WorkplaceModel.checkUserExist(workplaceId, userId)
}

const getUserCount = async (workplaceId) => {
  return await WorkplaceModel.getUserCount(workplaceId)
}
// const checkWorkplaceAdmin = async (workplaceId, userId) => {
//   return WorkplaceModel.checkWorkplaceAdmin(workplaceId, userId)
// }

export const WorkplaceService = {
  createNew,
  getWorkplace,
  update,
  pushBoardOrder,
  addUser,
  getUsers,
  addBoard,
  checkUserExist,
  searchUsers,
  getUserCount
  // checkWorkplaceAdmin
}

