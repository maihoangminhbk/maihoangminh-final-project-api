import express from 'express'
import { BoardController } from '*/controllers/board.controller'
import { BoardValidation } from '*/validations/board.validation'
import auth from '*/middlewares/auth'

const router = express.Router()

router.route('/')
  .post(auth, BoardValidation.createNew, BoardController.createNew)

router.route('/:id')
  .get(auth, BoardController.getFullBoard)
  .put(auth, BoardValidation.update, BoardController.update)

export const boardRoutes = router
