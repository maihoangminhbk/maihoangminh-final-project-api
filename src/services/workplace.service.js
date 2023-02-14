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


    // Create ownership
    const ownershipData = {
      userId: data.userId,
      workplaceId: newWorkplaceId.toString()
    }

    const createdOwnership = await OwnershipService.createNew(ownershipData)


    // Create Board
    const boardData = {
      title: 'My board',
      workplaceId: newWorkplaceId.toString()
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

  const isUserExist = await WorkplaceModel.checkUserExist(id, userId)


  if (isUserExist) {
    throw new Conflict409Error('User permission exist in workplace')
  }

  await OwnershipService.pushWorkplaceOrder(userAdded._id.toString(), id, true)


  const insertData = {
    userId: userAdded._id.toString(),
    role: role
  }

  const result = await WorkplaceModel.addUser(id, insertData)

  return result
}

const getUsers = async (req) => {
  const { id } = req.params
  const users = await WorkplaceModel.getUsers(id)

  return users
}

export const WorkplaceService = {
  createNew,
  getWorkplace,
  update,
  pushBoardOrder,
  addUser,
  getUsers
}

