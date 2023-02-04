import express from 'express'
import { UserController } from '*/controllers/user.controller'
import { BoardValidation } from '*/validations/board.validation'

const router = express.Router()

router.route('/login')
  // .post(BoardValidation.createNew, BoardController.createNew)
  .post(UserController.login)

router.route('/signup')
  // .post(BoardValidation.createNew, BoardController.createNew)
  .post(UserController.signup)

router.route('/activate')
  .post(UserController.activate)

// router.route('/:id')
//   .get(BoardController.getFullBoard)
//   .put(BoardValidation.update, BoardController.update)

export const userRoutes = router
