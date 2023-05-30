import express from 'express'
import { SlackController } from '*/controllers/slack.controller'
// import { SlackValidation } from '*/validations/card.validation'
import auth from '*/middlewares/auth'

import authorization from '*/middlewares/authorization'
import { ROLE } from '*/ultilities/constants'

const router = express.Router()

router.route('/auth')
  .get(SlackController.auth)

router.route('/auth/callback')
  .get(SlackController.callback)

// router.route('/:id')
//   .get(auth, authorization(ROLE.BOARD_USER), CardController.getCard)
//   .put(auth, authorization(ROLE.BOARD_ADMIN), CardValidation.update, CardController.update)

// router.route('/:id/image/upload')
//   .post(auth, authorization(ROLE.BOARD_ADMIN), CardController.uploadImage)

export const slackRoutes = router
