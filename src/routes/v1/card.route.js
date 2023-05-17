import express from 'express'
import { CardController } from '*/controllers/card.controller'
import { CardValidation } from '*/validations/card.validation'
import auth from '*/middlewares/auth'

import authorization from '*/middlewares/authorization'
import { ROLE } from '*/ultilities/constants'

const router = express.Router()

router.route('/')
  .post(auth, authorization(ROLE.BOARD_ADMIN), CardValidation.createNew, CardController.createNew)

router.route('/:id')
  .put(auth, authorization(ROLE.BOARD_ADMIN), CardValidation.update, CardController.update)

router.route('/:id/image/upload')
  .post(auth, authorization(ROLE.BOARD_ADMIN), CardController.uploadImage)

export const cardRoutes = router
