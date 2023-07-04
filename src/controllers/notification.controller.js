import { NotificationService } from '*/services/notification.service'
import { HttpStatusCode } from '*/ultilities/constants'


const createNew = async (req, res) => {
  try {
    const result = await NotificationService.createNew(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const result = await NotificationService.update(id, req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const getNotification = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await NotificationService.getCard(id)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getPersonalNotifications = async (req, res, next) => {
  try {
    const result = await NotificationService.getPersonalNotifications(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getFollowingNotifications = async (req, res, next) => {
  try {
    const result = await NotificationService.getFollowingNotifications(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}


export const NotificationController = {
  createNew,
  update,
  getNotification,
  getPersonalNotifications,
  getFollowingNotifications
}