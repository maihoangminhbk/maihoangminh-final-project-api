import express from 'express'
import { BoardController } from '*/controllers/board.controller'
import { BoardValidation } from '*/validations/board.validation'
import auth from '*/middlewares/auth'

import authorization from '*/middlewares/authorization'
import { ROLE } from '*/ultilities/constants'

const router = express.Router()

router.route('/')
  .post(auth, authorization(ROLE.WORKPLACE_ADMIN), BoardValidation.createNew, BoardController.createNew)

router.route('/:id')
  .get(auth, BoardController.getFullBoard)
  .put(auth, authorization(ROLE.BOARD_ADMIN), BoardValidation.update, BoardController.update)

router.route('/:id/add-user')
  .post(auth, authorization(ROLE.BOARD_ADMIN), BoardController.addUser)

router.route('/:id/delete-user')
  .post(auth, authorization(ROLE.BOARD_ADMIN), BoardController.deleteUser)

router.route('/:id/update-user')
  .post(auth, authorization(ROLE.BOARD_ADMIN), BoardController.updateUser)

router.route('/:id/search-users')
  .post(auth, BoardController.searchUsers)

router.route('/:id/search-users-to-add')
  .post(auth, BoardController.searchUsersToAdd)

router.route('/:id/users')
  .get(auth, BoardController.getUsers)

export const boardRoutes = router
