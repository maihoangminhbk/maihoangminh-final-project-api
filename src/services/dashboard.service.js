import { TaskModel } from '*/models/task.model'
import { CardModel } from '*/models/card.model'
import { UserModel } from '*/models/user.model'
import { WorkplaceModel } from '*/models/workplace.model'
import { BoardModel } from '*/models/board.model'

import { OwnershipService } from '*/services/ownership.service'
import { TaskService } from '*/services/task.service'
import { BoardService } from '*/services/board.service'

import { NotPermission403Error, BadRequest400Error, Conflict409Error } from '../ultilities/errorsHandle/APIErrors'
import { CardService } from './card.service'
import { WorkplaceService } from './workplace.service'

const getTasksStatusFullStatistic = async (req) => {
  const { id, userId } = req.params

  const workplace = await WorkplaceModel.getOneById(id)

  if (!workplace) {
    throw new Error('Workplace not found!')
  }

  const users = await TaskService.getTasksStatusFullStatistic(id)

  return users
}

const getTasksStatusStatistic = async (req) => {
  const { id, userId } = req.params
  let { startTime, endTime } = req.query

  startTime = parseFloat(startTime)
  endTime = parseFloat(endTime)

  const board = await BoardModel.getOneById(id)

  if (!board) {
    throw new Error('Board not found!')
  }

  const users = await TaskService.getTasksStatusStatistic(id, startTime, endTime)

  return users
}

const getCardsStatusStatistic = async (req) => {
  const { id, userId } = req.params
  let { startTime, endTime } = req.query

  startTime = parseFloat(startTime)
  endTime = parseFloat(endTime)

  const board = await BoardModel.getOneById(id)

  if (!board) {
    throw new Error('Board not found!')
  }

  const users = await CardService.getCardsStatusStatistic(id, startTime, endTime)

  return users
}
const getCardsStatusFullStatistic = async (req) => {
  const { id, userId } = req.params

  const workplace = await WorkplaceModel.getOneById(id)

  if (!workplace) {
    throw new Error('Workplace not found!')
  }

  const users = await CardService.getCardsStatusFullStatistic(id)

  return users
}

const getWorkplaceStatistic = async (req) => {
  const { id, userId } = req.params

  const workplace = await WorkplaceModel.getOneById(id)

  if (!workplace) {
    throw new Error('Workplace not found!')
  }

  const userCount = await WorkplaceService.getUserCount(id)

  const cardCount = await CardService.getCardCount(id)

  const taskCount = await TaskService.getTaskCount(id)

  const result = {
    userCount: userCount,
    cardCount: cardCount,
    taskCount: taskCount
  }

  return result
}

const getBoardStatistic = async (req) => {
  const { id, userId } = req.params

  const board = await BoardModel.getOneById(id)

  if (!board) {
    throw new Error('Board not found!')
  }

  const userCount = await BoardService.getUserCount(id)

  const cardCount = await CardService.getCardCountFromBoard(id)

  const taskCount = await TaskService.getTaskCountFromBoard(id)

  const result = {
    userCount: userCount,
    cardCount: cardCount,
    taskCount: taskCount
  }

  return result
}

const getWorkplaceUserCountStatistic = async (req) => {
  const { id, userId } = req.params

  const workplace = await WorkplaceModel.getOneById(id)

  if (!workplace) {
    throw new Error('Workplace not found!')
  }

  const result = await BoardService.getWorkplaceUserCountStatistic(id)

  return result
}

const getTasksStatusInYearStatistic = async (req) => {
  const { id, userId } = req.params
  let { year } = req.query

  year = parseFloat(year)

  const board = await BoardModel.getOneById(id)

  if (!board) {
    throw new Error('Board not found!')
  }

  const result = await TaskService.getTasksStatusInYearStatistic(id, year)

  return result
}

const getUsersInfoStatistic = async (req) => {
  const { id, userId } = req.params
  let { keyword, page } = req.query

  // page = parseInt(page)

  const board = await BoardModel.getOneById(id)

  if (!board) {
    throw new Error('Board not found!')
  }

  // const result = await UserModel.getUsersInfoStatistic(id, keyword, page)
  const result = await TaskModel.getUsersInfoStatistic(id, keyword, page)

  return result
}
export const DashboardService = {
  getTasksStatusStatistic,
  getTasksStatusFullStatistic,
  getCardsStatusStatistic,
  getWorkplaceStatistic,
  getBoardStatistic,
  getCardsStatusFullStatistic,
  getWorkplaceUserCountStatistic,
  getTasksStatusInYearStatistic,
  getUsersInfoStatistic
}