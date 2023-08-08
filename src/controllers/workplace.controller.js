import { WorkplaceService } from '*/services/workplace.service'
import { HttpStatusCode } from '*/ultilities/constants'


const createNew = async (req, res) => {
  try {
    req.body.userId = req.params.userId
    const result = await WorkplaceService.createNew(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    console.log(error)
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const getWorkplace = async (req, res) => {
  try {
    const { userId, id } = req.params
    const workplaceResult = await WorkplaceService.getWorkplace(id)
    const result = await WorkplaceService.getWorkplaceFilter(workplaceResult, userId)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const update = async (req, res) => {
  try {
    const { userId, id } = req.params
    const workplaceResult = await WorkplaceService.update(id, req.body)
    const result = await WorkplaceService.getWorkplaceFilter(workplaceResult, userId)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const addUser = async (req, res, next) => {
  try {
    const result = await WorkplaceService.addUser(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getUsers = async (req, res, next) => {
  try {
    const result = await WorkplaceService.getUsers(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const searchUsers = async (req, res, next) => {
  try {
    const result = await WorkplaceService.searchUsers(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const addBoard = async (req, res, next) => {
  try {
    const { userId, id } = req.params
    req.body.userId = req.params.userId
    const workplaceResult = await WorkplaceService.addBoard(id, req.body)
    const result = await WorkplaceService.getWorkplaceFilter(workplaceResult, userId)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const WorkplaceController = {
  createNew,
  getWorkplace,
  update,
  addUser,
  getUsers,
  searchUsers,
  addBoard
}