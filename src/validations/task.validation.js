import Joi from 'joi'
import { HttpStatusCode } from '*/ultilities/constants'

const createNew = async (req, res, next) => {
  const condition = Joi.object({
    cardId: Joi.string().required(), // Also ObjectId when create new
    title: Joi.string().required().min(3).max(100).trim(),
    status: Joi.number().integer().min(0).max(5), // 0: created; 1: inprocess; 2: done; 3: completed; 4: late; 5: canceled
    percent: Joi.number().integer().min(0).max(100),
    checked: Joi.boolean(),
    startTime: Joi.date().timestamp(),
    endTime: Joi.date().timestamp()
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
    cardId: Joi.string(), // Also ObjectId when create new
    boardId: Joi.string(), // Also ObjectId when create new
    workplaceId: Joi.string(), // Also ObjectId when create new
    title: Joi.string().min(3).max(100).trim(),
    status: Joi.number().integer().min(0).max(5), // 0: created; 1: inprocess; 2: done; 3: completed; 4: late; 5: canceled
    percent: Joi.number().integer().min(0).max(100),
    startTime: Joi.date().timestamp(),
    endTime: Joi.date().timestamp()
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
    email: Joi.string()
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

export const TaskValidation = {
  createNew,
  update,
  addUser
}