import express from 'express'
import { TaskController } from '*/controllers/task.controller'
import { TaskValidation } from '*/validations/task.validation'
import auth from '*/middlewares/auth'

import authorization from '*/middlewares/authorization'
import { ROLE } from '*/ultilities/constants'

const router = express.Router()

router.route('/')
  .post(auth, TaskValidation.createNew, TaskController.createNew)

router.route('/:id')
  .put(auth, TaskValidation.update, TaskController.update)

router.route('/:id/add-user')
  .post(auth, TaskController.addUser)

export const taskRoutes = router