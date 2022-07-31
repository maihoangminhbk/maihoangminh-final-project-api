import { UserService } from '*/services/user.service'
import { HttpStatusCode } from '*/ultilities/constants'


const login = async (req, res) => {
  try {
    const result = await UserService.login(req.body)
    console.log(result)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const signup = async (req, res) => {
  try {
    console.log(req.body)
    const result = await UserService.signup(req.body)
    console.log(result)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

// const getFullBoard = async (req, res) => {
//   try {
//     const { id } = req.params
//     console.log('board controller - getfullboard', req.params)
//     const result = await BoardService.getFullBoard(id)
//     console.log(result)
//     res.status(HttpStatusCode.OK).json(result)
//   } catch (error) {
//     res.status(HttpStatusCode.INTERNAL_SERVER).json({
//       errors: error.message
//     })
//   }
// }

// const update = async (req, res) => {
//   try {
//     const { id } = req.params
//     const result = await BoardService.update(id, req.body)
//     res.status(HttpStatusCode.OK).json(result)
//   } catch (error) {
//     res.status(HttpStatusCode.INTERNAL_SERVER).json({
//       errors: error.message
//     })
//   }
// }


export const UserController = {
  login,
  signup
  // getFullBoard,
  // update
}