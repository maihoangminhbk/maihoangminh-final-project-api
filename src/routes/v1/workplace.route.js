import express from 'express'
import { WorkplaceController } from '*/controllers/workplace.controller'
// import { WorkplaceValidation } from '*/validations/workplace.validation'
import auth from '*/middlewares/auth'

const router = express.Router()

router.route('/')
  // .post(WorkplaceValidation.createNew, WorkplaceController.createNew)
  .post(auth, WorkplaceController.createNew)
router.route('/:id')
  .get(auth, WorkplaceController.getWorkplace)
//   .put(WorkplaceValidation.update, WorkplaceController.update)
router.route('/:id/add-user')
  .post(auth, WorkplaceController.addUser)

router.route('/:id/users')
  .get(auth, WorkplaceController.getUsers)

export const workplaceRoutes = router
