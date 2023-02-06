import { UserService } from '*/services/user.service'
import { HttpStatusCode } from '*/ultilities/constants'

const login = async (req, res, next) => {
  try {
    const result = await UserService.login(req.body)
    console.log(result)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const signup = async (req, res, next) => {
  try {
    console.log(req.body)
    const result = await UserService.signup(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const activate = async (req, res, next) => {
  try {
    const result = await UserService.activate(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const UserController = {
  login,
  signup,
  activate
}