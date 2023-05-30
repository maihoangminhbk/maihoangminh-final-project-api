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

export const notificationRoutes = router
