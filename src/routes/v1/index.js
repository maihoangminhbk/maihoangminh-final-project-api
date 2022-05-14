import express from 'express'
import { HttpStatusCode } from '*/ultilities/constants'
import { boardRoutes } from './board.route'
const router = express.Router()

/**
 * Get v1 Status
 */
router.get('/status', (req, res) => res.status(HttpStatusCode.OK).json({ status: 'OK!' }))

/**
 * Board API
 */
router.use('/boards', boardRoutes)

export const apiV1 = router
