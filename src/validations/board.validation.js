import Joi from 'joi'
import { HttpStatusCode } from '*/ultilities/constants'

const createNew = async (req, res, next) => {

  const condition = Joi.object({
    title: Joi.string().required().min(3).max(100).trim(),
    workplaceId: Joi.string().required().min(3).trim()
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
    title: Joi.string().min(3).max(100).trim(),
    columnOrder: Joi.array().items(Joi.string())
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

export const BoardValidation = {
  createNew,
  update
}