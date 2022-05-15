import express from 'express'
import { HttpStatusCode } from '*/ultilities/constants'
import { boardRoutes } from './board.route'
import { columnRoutes } from './column.route'
import { cardRoutes } from './card.route'

const router = express.Router()

/**
 * Get v1 Status
 */
router.get('/status', (req, res) => res.status(HttpStatusCode.OK).json({ status: 'OK!' }))

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

export const apiV1 = router
