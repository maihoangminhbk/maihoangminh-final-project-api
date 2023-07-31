import Joi from 'joi'
import { HttpStatusCode } from '*/ultilities/constants'
import { BadRequest400Error } from '*/ultilities/errorsHandle/APIErrors'

const loginWithGoogle = async (req, res, next) => {
  const condition = Joi.object({
    name: Joi.string().required().min(3).max(100).trim(),
    email: Joi.string().required().min(3).trim(),
    cover: Joi.string().default(null)
  })

  try {
    await condition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new BadRequest400Error('Can not solve login data'))
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

export const UserValidation = {
  loginWithGoogle,
  update
}