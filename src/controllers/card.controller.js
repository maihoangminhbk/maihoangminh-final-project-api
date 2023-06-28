import { CardService } from '*/services/card.service'
import { HttpStatusCode } from '*/ultilities/constants'


const createNew = async (req, res) => {
  try {
    const { userId } = req.params

    const data = {
      ...req.body,
      userId: userId
    }

    const result = await CardService.createNew(data)
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
    const result = await CardService.update(id, req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const uploadImage = async (req, res) => {
  try {
    const { id } = req.params
    const result = await CardService.uploadImage(req, res)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const getCard = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await CardService.getCard(id)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getCalendarCards = async (req, res, next) => {
  try {
    const { userId } = req.params

    const data = {
      ...req.body,
      userId: userId
    }

    const result = await CardService.getCalendarCards(data)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const addUser = async (req, res, next) => {
  try {
    const result = await CardService.addUser(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const searchUsers = async (req, res, next) => {
  try {
    const result = await CardService.searchUsers(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const searchUsersToAdd = async (req, res, next) => {
  try {
    const result = await CardService.searchUsersToAdd(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    const result = await CardService.deleteUser(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}


export const CardController = {
  createNew,
  update,
  uploadImage,
  getCard,
  getCalendarCards,
  addUser,
  searchUsers,
  searchUsersToAdd,
  deleteUser
}