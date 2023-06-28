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
  .get(auth, authorization(ROLE.BOARD_USER), CardController.getCard)
  .put(auth, authorization(ROLE.BOARD_ADMIN), CardValidation.update, CardController.update)

router.route('/:id/add-user')
  .post(auth, authorization(ROLE.BOARD_ADMIN), CardValidation.addUser, CardController.addUser)

router.route('/:id/delete-user')
  .post(auth, authorization(ROLE.BOARD_ADMIN), CardController.deleteUser)

// router.route('/:id/update-user')
//   .post(auth, authorization(ROLE.BOARD_ADMIN), CardController.updateUser)

router.route('/:id/search-users')
  .post(auth, CardController.searchUsers)

router.route('/:id/search-users-to-add')
  .post(auth, CardController.searchUsersToAdd)

router.route('/:id/image/upload')
  .post(auth, authorization(ROLE.BOARD_ADMIN), CardController.uploadImage)

router.route('/get-calendar-cards')
  .post(auth, CardValidation.getCalendarCards, CardController.getCalendarCards)

export const cardRoutes = router
