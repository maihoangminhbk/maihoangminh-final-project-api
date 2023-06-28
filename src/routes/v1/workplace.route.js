import express from 'express'
import { WorkplaceController } from '*/controllers/workplace.controller'
// import { WorkplaceValidation } from '*/validations/workplace.validation'
import auth from '*/middlewares/auth'
import authorization from '*/middlewares/authorization'
import { ROLE } from '*/ultilities/constants'

const router = express.Router()

router.route('/')
  // .post(WorkplaceValidation.createNew, WorkplaceController.createNew)
  .post(auth, WorkplaceController.createNew)
router.route('/:id')
  .get(auth, WorkplaceController.getWorkplace)
  .put(auth, authorization(ROLE.WORKPLACE_ADMIN), WorkplaceController.update)
router.route('/:id/add-user')
  .post(auth, authorization(ROLE.WORKPLACE_ADMIN), WorkplaceController.addUser)

router.route('/:id/users')
  .get(auth, WorkplaceController.getUsers)

router.route('/:id/search-users')
  .post(auth, WorkplaceController.searchUsers)

router.route('/:id/add-board')
  .post(auth, authorization(ROLE.WORKPLACE_ADMIN), WorkplaceController.addBoard)

export const workplaceRoutes = router
