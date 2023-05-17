import express from 'express'
import { TaskController } from '*/controllers/task.controller'
import { TaskValidation } from '*/validations/task.validation'

const router = express.Router()

router.route('/')
  .post(TaskValidation.createNew, TaskController.createNew)

router.route('/:id')
  .put(TaskValidation.update, TaskController.update)

export const taskRoutes = router