import { BoardService } from '*/services/board.service'
import { HttpStatusCode } from '*/ultilities/constants'


const createNew = async (req, res) => {
  try {
    req.body.userId = req.params.userId

    const result = await BoardService.createNew(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const getFullBoard = async (req, res) => {
  try {
    const { id } = req.params
    const result = await BoardService.getFullBoard(id)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const result = await BoardService.update(id, req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const addUser = async (req, res, next) => {
  try {
    const result = await BoardService.addUser(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getUsers = async (req, res, next) => {
  try {
    const result = await BoardService.getUsers(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}


export const BoardController = {
  createNew,
  getFullBoard,
  update,
  addUser,
  getUsers
}