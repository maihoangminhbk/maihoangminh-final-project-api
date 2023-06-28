import express from 'express'
import { DashboardController } from '*/controllers/dashboard.controller'
// import { DashboardValidation } from '*/validations/dashboard.validation'
import auth from '*/middlewares/auth'

import authorization from '*/middlewares/authorization'
import { ROLE } from '*/ultilities/constants'

const router = express.Router()

router.route('/:id/get-cards-status-statistic')
  .get(auth, DashboardController.getCardsStatusStatistic)

router.route('/:id/get-cards-status-full-statistic')
  .get(auth, DashboardController.getCardsStatusFullStatistic)

router.route('/:id/get-workplace-statistic')
  .get(auth, DashboardController.getWorkplaceStatistic)

router.route('/:id/get-board-statistic')
  .get(auth, DashboardController.getBoardStatistic)

router.route('/:id/get-tasks-status-statistic')
  .get(auth, DashboardController.getTasksStatusStatistic)

router.route('/:id/get-tasks-status-full-statistic')
  .get(auth, DashboardController.getTasksStatusFullStatistic)

router.route('/:id/get-workplace-users-count-statistic')
  .get(auth, DashboardController.getWorkplaceUserCountStatistic)

router.route('/:id/get-tasks-status-in-year-statistic')
  .get(auth, DashboardController.getTasksStatusInYearStatistic)

router.route('/:id/get-users-info-statistic')
  .get(auth, DashboardController.getUsersInfoStatistic)

// router.route('/:id')
//   .put(auth, TaskValidation.update, TaskController.update)

// router.route('/:id/add-user')
//   .post(auth, TaskValidation.addUser, TaskController.addUser)


export const dashboardRoutes = router