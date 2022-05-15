import express from 'express'
import { CardController } from '*/controllers/card.controller'
import { CardValidation } from '*/validations/card.validation'

const router = express.Router()

router.route('/')
  .post(CardValidation.createNew, CardController.createNew)

// router.route('/:id')
//   .put(ColumnValidation.update, ColumnController.update)


export const cardRoutes = router
