import { TaskService } from '*/services/task.service'
import { HttpStatusCode } from '*/ultilities/constants'


const createNew = async (req, res) => {
  try {
    const { userId } = req.params

    const data = {
      ...req.body,
      userId: userId
    }

    const result = await TaskService.createNew(data)
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
    const result = await TaskService.update(id, req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const getCardId = async (req, res) => {
  try {
    const { id } = req.params
    const result = await TaskService.getCardId(id)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

// const uploadImage = async (req, res) => {
//   try {
//     const { id } = req.params
//     const result = await CardService.uploadImage(req, res)
//   } catch (error) {
//     res.status(HttpStatusCode.INTERNAL_SERVER).json({
//       errors: error.message
//     })
//   }
// }

const addUser = async (req, res, next) => {
  try {
    const result = await TaskService.addUser(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const searchUsers = async (req, res, next) => {
  try {
    const result = await TaskService.searchUsers(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const searchUsersToAdd = async (req, res, next) => {
  try {
    const result = await TaskService.searchUsersToAdd(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    const result = await TaskService.deleteUser(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}


export const TaskController = {
  createNew,
  update,
  getCardId,
  // uploadImage
  addUser,
  searchUsers,
  searchUsersToAdd,
  deleteUser
}