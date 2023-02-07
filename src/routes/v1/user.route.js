import express from 'express'
import { UserController } from '*/controllers/user.controller'
import { UserValidation } from '*/validations/user.validation'

const router = express.Router()

router.route('/login')
  // .post(BoardValidation.createNew, BoardController.createNew)
  .post(UserController.login)

router.route('/signup')
  // .post(BoardValidation.createNew, BoardController.createNew)
  .post(UserController.signup)

router.route('/activate')
  .post(UserController.activate)

router.route('/login/google')
  .post(UserValidation.loginWithGoogle, UserController.loginWithGoogle)

// router.route('/:id')
//   .get(BoardController.getFullBoard)
//   .put(BoardValidation.update, BoardController.update)

export const userRoutes = router
