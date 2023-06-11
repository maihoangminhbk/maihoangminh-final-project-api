import express from 'express'
import { SlackController } from '*/controllers/slack.controller'
// import { SlackValidation } from '*/validations/card.validation'
import auth from '*/middlewares/auth'

import authorization from '*/middlewares/authorization'
import { ROLE } from '*/ultilities/constants'

const router = express.Router()

router.route('/auth')
  .post(SlackController.auth)

router.route('/auth/callback')
  .get(SlackController.callback)

router.route('/get-workspace')
  .post(SlackController.getWorkspace)

router.route('/create-connection')
  .post(SlackController.createConnection)

router.route('/get-connections')
  .post(SlackController.getConnections)

router.route('/update-connection')
  .post(SlackController.updateConnection)

router.route('/get-channels')
  .post(SlackController.getChannels)

// router.route('/get-connections')
//   .post(SlackController.getConnections)
//   .put(auth, authorization(ROLE.BOARD_ADMIN), CardValidation.update, CardController.update)

// router.route('/:id/image/upload')
//   .post(auth, authorization(ROLE.BOARD_ADMIN), CardController.uploadImage)

export const slackRoutes = router
