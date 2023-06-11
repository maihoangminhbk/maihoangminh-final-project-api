import Joi from 'joi'
import { HttpStatusCode } from '*/ultilities/constants'

const createNew = async (req, res, next) => {
  const condition = Joi.object({
    boardId: Joi.string().required(),
    columnId: Joi.string().required(),
    title: Joi.string().required().min(3).max(20).trim()
    // description: Joi.string().max(1000).trim(),

  })

  try {
    await condition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      errors: new Error(error).message
    })
  }
}

const update = async (req, res, next) => {
  const condition = Joi.object({
    title: Joi.string().min(3).max(30).trim(),
    boardId: Joi.string(),
    columnId: Joi.string(),
    description: Joi.string().max(1000).trim(),
    startTime: Joi.date().timestamp().allow(null),
    endTime: Joi.date().timestamp().allow(null)
  })

  try {
    await condition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      errors: new Error(error).message
    })
  }
}

const getCalendarCards = async (req, res, next) => {
  const condition = Joi.object({
    workplaceId: Joi.string(),
    boardList: Joi.array().items(
      Joi.string()
    )
  })

  try {
    await condition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      errors: new Error(error).message
    })
  }
}

const addUser = async (req, res, next) => {
  const condition = Joi.object({
    cardId: Joi.string()
  })

  try {
    await condition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      errors: new Error(error).message
    })
  }
}

export const CardValidation = {
  createNew,
  update,
  getCalendarCards,
  addUser
}