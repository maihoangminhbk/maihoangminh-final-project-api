import { OwnershipService } from '*/services/ownership.service'
import { HttpStatusCode } from '*/ultilities/constants'


const createNew = async (req, res) => {
  try {
    req.body.userId = req.params.userId
    console.log('ownership controller - createNew - req body', req.body)
    const result = await OwnershipService.createNew(req.body)
    console.log(result)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const getOwnershipByUserId = async (req, res) => {
  try {
    const { userId } = req.params
    console.log('ownership controller - getOwnershipByUserId', req.params)
    const result = await OwnershipService.getOwnershipByUserId(userId)
    console.log(result)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const update = async (req, res) => {
  try {
    const { userId } = req.params
    const result = await OwnershipService.update(userId, req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}


export const OwnershipController = {
  createNew,
  getOwnershipByUserId,
  update
}