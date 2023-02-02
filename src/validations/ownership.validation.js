import Joi from 'joi'
import { HttpStatusCode } from '*/ultilities/constants'

const createNew = async (req, res, next) => {
  const condition = Joi.object({
    workplaceId: Joi.string().required()
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
    userId: Joi.string().required(),
    workplaceOrder: Joi.array().items(Joi.string())
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

export const OwnershipValidation = {
  createNew,
  update
}