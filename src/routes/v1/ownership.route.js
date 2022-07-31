import express from 'express'
import { OwnershipController } from '*/controllers/ownership.controller'
import { OwnershipValidation } from '*/validations/ownership.validation'
import auth from '*/middlewares/auth'

const router = express.Router()

router.route('/')
  .post(auth, OwnershipValidation.createNew, OwnershipController.createNew)

router.route('/')
  .get(auth, OwnershipController.getOwnershipByUserId)
  // .put(BoardValidation.update, BoardController.update)

export const ownershipRoutes = router
