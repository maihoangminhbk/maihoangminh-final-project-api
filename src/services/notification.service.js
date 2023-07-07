import { NotificationModel } from '*/models/notification.model'
import { UserModel } from '*/models/user.model'
import { BoardModel } from '*/models/board.model'
import { CardModel } from '*/models/card.model'
import { TaskModel } from '*/models/task.model'
import { ColumnModel } from '*/models/column.model'
import { WorkplaceService } from './workplace.service'

// import { OwnershipService } from './ownership.service'

import { HttpStatusCode } from '*/ultilities/constants'

import { NotPermission403Error, BadRequest400Error, Conflict409Error } from '../ultilities/errorsHandle/APIErrors'
import { SlackService } from './slack.service'
import { OwnershipModel } from '../models/ownership.model'


const createNew = async (data) => {
  try {
    const { workplaceId, boardId, userCreateId, action, userTargetId, objectTargetType, objectTargetId, notificationType } = data

    const userCreate = await UserModel.getOneById(userCreateId)
    const userTarget = await UserModel.getOneById(userTargetId)
    let objectTarget

    switch (objectTargetType) {
    case 'board':
      objectTarget = await BoardModel.getOneById(objectTargetId)
      break
    case 'card':
      objectTarget = await CardModel.getOneById(objectTargetId)
      break
    case 'task':
      objectTarget = await TaskModel.getTask(objectTargetId)
      break
    case 'column':
      objectTarget = await ColumnModel.getColumn(objectTargetId)
      break

    default:
      break
    }


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

    // Post notification to slack
    try {
      if (workplaceId && boardId && notificationType === 'board') {
        const token = await SlackService.getWorkspaceToken(workplaceId)

        const getConnectionsData = {
          workplaceId: workplaceId
        }

        const connections = await SlackService.getConnections(getConnectionsData)

        for (const connection of connections) {
          if (boardId === connection.boardId.toString()) {
            await SlackService.postMessage(connection.slackChannel, token, notificationData)
          }
        }
      }
    } catch (error) {
      console.log(error)
    }


    const result = await NotificationModel.createNew(notificationData)
    // const result = 'ok'

    return result
  } catch (error) {
    console.log(error)
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

const getPersonalNotifications = async (req) => {
  try {
    const { id, userId } = req.params
    let { page } = req.query

    const workplace = await WorkplaceService.getWorkplace(id)
    if (!workplace) {
      throw new BadRequest400Error('Workplace not exist')
    }

    const notification = await NotificationModel.getPersonalNotifications(id, userId, page)

    if (!notification) {
      throw new Error('Notification not found!')
    }

    return notification
  } catch (error) {
    throw new Error(error)
  }
}

const getFollowingNotifications = async (req) => {
  try {
    const { id, userId } = req.params
    let { page } = req.query

    const workplace = await WorkplaceService.getWorkplace(id)
    if (!workplace) {
      throw new BadRequest400Error('Workplace not exist')
    }

    const ownership = await OwnershipModel.getOwnershipByUserId(userId)

    const dataSearch = {}

    dataSearch.cards = ownership.cardOrder.map(card => card.cardId)
    dataSearch.tasks = ownership.cardOrder.map(task => task.taskId)


    const notification = await NotificationModel.getFollowingNotifications(id, dataSearch, page)

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
  getNotification,
  getPersonalNotifications,
  getFollowingNotifications
}