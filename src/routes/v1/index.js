import express from 'express'
import { HttpStatusCode } from '*/ultilities/constants'
import { boardRoutes } from './board.route'
import { columnRoutes } from './column.route'
import { cardRoutes } from './card.route'
import { taskRoutes } from './task.route'
import { userRoutes } from './user.route'
import { workplaceRoutes } from './workplace.route'
import { ownershipRoutes } from './ownership.route'
import { notificationRoutes } from './notification.route'
import { slackRoutes } from './slack.route'

import { logError, returnError, logErrorMiddleware } from '*/middlewares/errorsHandler'

const router = express.Router()

/**
 * Get v1 Status
 */
router.get('/status', (req, res) => {
  res.status(HttpStatusCode.OK).json({ status: 'OK!' })
})

/**
 * Board API
 */
router.use('/boards', boardRoutes)

/**
 * Column API
 */
router.use('/columns', columnRoutes)

/**
 * Card API
 */
router.use('/cards', cardRoutes)

/**
 * Task API
 */
router.use('/tasks', taskRoutes)

/**
 * User API
 */
router.use('/users', userRoutes)

/**
 * Workplace API
 */
router.use('/workplaces', workplaceRoutes)

/**
 * Ownership API
 */
router.use('/ownership', ownershipRoutes)

/**
 * Notification API
 */
router.use('/notifications', notificationRoutes)

/**
 * Slack API
 */
router.use('/slack', slackRoutes)

router.use(returnError)

export const apiV1 = router
