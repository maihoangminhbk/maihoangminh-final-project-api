import { NotificationModel } from '*/models/notification.model'
import { UserModel } from '*/models/user.model'
import { BoardModel } from '*/models/board.model'

// import { OwnershipService } from './ownership.service'

import { HttpStatusCode } from '*/ultilities/constants'

import { NotPermission403Error, BadRequest400Error, Conflict409Error } from '../ultilities/errorsHandle/APIErrors'


const createNew = async (data) => {
  try {
    const { userCreateId, action, userTargetId, objectTargetType, objectTargetId } = data

    const userCreate = await UserModel.getOneById(userCreateId)
    const userTarget = await UserModel.getOneById(userTargetId)
    const objectTarget = await BoardModel.getOneById(objectTargetId)


    const notificationData = {
      ...data,
      userCreateName: userCreate.name,
      objectTargetName: objectTarget.title
    }

    if (userCreate.cover) {
      notificationData.userCreateAvatar = userCreate.cover
    }

    if (userTarget) {
      notificationData.userTargetName = userTarget.name
    } else {
      delete notificationData.userTargetId
    }

    const result = await NotificationModel.createNew(notificationData)

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: Date.now()
    }

    if (updateData._id) delete updateData._id

    const updatedCard = await NotificationModel.update(id, updateData)

    return updatedCard
  } catch (error) {
    throw new Error(error)
  }
}

const getNotification = async (notificationId) => {
  try {
    const notification = await NotificationModel.getCard(notificationId)

    if (!notification) {
      throw new Error('Notification not found!')
    }


    return notification
  } catch (error) {
    throw new Error(error)
  }
}

export const NotificationService = {
  createNew,
  update,
  getNotification
}