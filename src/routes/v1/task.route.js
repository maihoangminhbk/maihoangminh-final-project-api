import express from 'express'
import { TaskController } from '*/controllers/task.controller'
import { TaskValidation } from '*/validations/task.validation'
import auth from '*/middlewares/auth'

import authorization from '*/middlewares/authorization'
import { ROLE } from '*/ultilities/constants'

const router = express.Router()

router.route('/')
  .post(auth, authorization(ROLE.BOARD_ADMIN), TaskValidation.createNew, TaskController.createNew)

router.route('/:id')
  .put(auth, authorization(ROLE.TASK_USER), TaskValidation.update, TaskController.update)

router.route('/:id/get-card-id')
  .get(auth, authorization(ROLE.TASK_USER), TaskController.getCardId)

router.route('/:id/add-user')
  .post(auth, authorization(ROLE.BOARD_ADMIN), TaskValidation.addUser, TaskController.addUser)

router.route('/:id/delete-user')
  .post(auth, authorization(ROLE.BOARD_ADMIN), TaskController.deleteUser)

// router.route('/:id/update-user')
//   .post(auth, authorization(ROLE.BOARD_ADMIN), CardController.updateUser)

router.route('/:id/search-users')
  .post(auth, authorization(ROLE.TASK_USER), TaskController.searchUsers)

router.route('/:id/search-users-to-add')
  .post(auth, authorization(ROLE.TASK_USER), TaskController.searchUsersToAdd)

// router.route('/:id/add-user')
//   .post(auth, TaskController.addUser)


export const taskRoutes = router