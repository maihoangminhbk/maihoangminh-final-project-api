import express from 'express'
import { NotificationController } from '*/controllers/notification.controller'
import auth from '*/middlewares/auth'

import authorization from '*/middlewares/authorization'
import { ROLE } from '*/ultilities/constants'

const router = express.Router()

router.route('/')
  .post(auth, NotificationController.createNew)

router.route('/:id')
  .get(auth, NotificationController.getNotification)
  .put(auth, NotificationController.update)

router.route('/:id/get-personal-notifications')
  .get(auth, NotificationController.getPersonalNotifications)

router.route('/:id/get-following-notifications')
  .get(auth, NotificationController.getFollowingNotifications)

export const notificationRoutes = router
