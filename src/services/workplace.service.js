import { WorkplaceModel } from '*/models/workplace.model'
import { BoardService } from '*/services/board.service'
// import { cloneDeep } from 'lodash'
const createNew = async (data) => {
  try {

    const result = await WorkplaceModel.createNew(data)

    const boardData = {
      title: 'My board'
    }

    const createdBoard = await BoardService.createNew(boardData)

    const newWorkplaceId = result.insertedId

    boardData.boardId = createdBoard._id.toString()

    console.log('workplaceservice - create new- boarddata', boardData)

    const updatedWorkplace = await pushBoardOrder(newWorkplaceId, boardData)

    console.log('workplaceservice - create new- updatedWorkplace', updatedWorkplace)
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

export const WorkplaceService = {
  createNew,
  getWorkplace,
  update,
  pushBoardOrder
}
