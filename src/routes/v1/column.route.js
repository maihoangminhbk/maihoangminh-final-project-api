import express from 'express'
import { ColumnController } from '*/controllers/column.controller'
import { ColumnValidation } from '*/validations/column.validation'
import auth from '*/middlewares/auth'

import authorization from '*/middlewares/authorization'
import { ROLE } from '*/ultilities/constants'

const router = express.Router()

router.route('/')
  .post(auth, authorization(ROLE.BOARD_ADMIN), ColumnValidation.createNew, ColumnController.createNew)

router.route('/:id')
  .put(auth, authorization(ROLE.BOARD_ADMIN), ColumnValidation.update, ColumnController.update)


export const columnRoutes = router
