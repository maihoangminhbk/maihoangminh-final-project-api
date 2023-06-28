import { DashboardService } from '*/services/dashboard.service'
import { HttpStatusCode } from '*/ultilities/constants'


const getTasksStatusFullStatistic = async (req, res, next) => {
  try {
    const result = await DashboardService.getTasksStatusFullStatistic(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getTasksStatusStatistic = async (req, res, next) => {
  try {
    const result = await DashboardService.getTasksStatusStatistic(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getCardsStatusStatistic = async (req, res, next) => {
  try {
    const result = await DashboardService.getCardsStatusStatistic(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getCardsStatusFullStatistic = async (req, res, next) => {
  try {
    const result = await DashboardService.getCardsStatusFullStatistic(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getWorkplaceStatistic = async (req, res, next) => {
  try {
    const result = await DashboardService.getWorkplaceStatistic(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getBoardStatistic = async (req, res, next) => {
  try {
    const result = await DashboardService.getBoardStatistic(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getWorkplaceUserCountStatistic = async (req, res, next) => {
  try {
    const result = await DashboardService.getWorkplaceUserCountStatistic(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getTasksStatusInYearStatistic = async (req, res, next) => {
  try {
    const result = await DashboardService.getTasksStatusInYearStatistic(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getUsersInfoStatistic = async (req, res, next) => {
  try {
    const result = await DashboardService.getUsersInfoStatistic(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}


export const DashboardController = {
  getTasksStatusStatistic,
  getTasksStatusFullStatistic,
  getCardsStatusStatistic,
  getCardsStatusFullStatistic,
  getWorkplaceStatistic,
  getBoardStatistic,
  getWorkplaceUserCountStatistic,
  getTasksStatusInYearStatistic,
  getUsersInfoStatistic
}