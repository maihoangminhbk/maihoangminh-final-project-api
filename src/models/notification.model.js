import Joi from 'joi'
import { getDB } from '*/config/mongodb'
import { ObjectId } from 'mongodb'
import { TaskModel } from './task.model'

import { ROWS_NUMBER } from '../ultilities/constants'

// Define card collection
const notificationCollectionName = 'notifications'
const notificationCollectionSchema = Joi.object({
  workplaceId: Joi.string().required(),
  boardId: Joi.string().required(),
  boardTitle: Joi.string().required().min(3).max(100).trim(),
  notificationType: Joi.string().required().valid('board', 'workplace', 'personal', 'deadline', 'late'),
  userCreateId: Joi.string().required(),
  userCreateName: Joi.string().required().min(3).max(100).trim(),
  userCreateAvatar: Joi.string().default(null),
  action: Joi.string().required().valid('created', 'updated', 'removed', 'added', 'had'),
  userTargetId: Joi.string().default(null),
  userTargetName: Joi.string().min(3).max(100).trim().default(null),
  objectTargetId: Joi.string().required(),
  objectTargetType: Joi.string().required().valid('workplace', 'board', 'column', 'card', 'task'),
  objectTargetName: Joi.string().required().min(3).max(100).trim(),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(Date.now()),
  _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
  return await notificationCollectionSchema.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validatedValue = await validateSchema(data)

    const insertValue = {
      ...validatedValue,
      workplaceId: ObjectId(validatedValue.workplaceId),
      boardId: ObjectId(validatedValue.boardId),
      userCreateId: ObjectId(validatedValue.userCreateId),
      objectTargetId: ObjectId(validatedValue.objectTargetId)
    }

    if (insertValue.userTargetId) {
      insertValue.userTargetId = ObjectId(validatedValue.userTargetId)
    }

    const result = await getDB().collection(notificationCollectionName).insertOne(insertValue)

    return result
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {

    const insertValue = {
      ...data,
      workplaceId: ObjectId(data.workplaceId),
      boardId: ObjectId(data.boardId),
      userCreateId: ObjectId(data.userCreateId),
      userTargetId: ObjectId(data.userTargetId),
      objectTargetId: ObjectId(data.objectTargetId)
    }

    const result = await getDB().collection(notificationCollectionName).findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: insertValue },
      { returnDocument : 'after', returnOriginal : false }
    ).then(
      updatedColumn => {
        return updatedColumn
      }
    )

    return result.value

  } catch (error) {
    throw new Error(error)
  }
}

const getPersonalNotifications = async (workplaceId, userId, page) => {
  try {
    // const PAGE_SIZE = ROWS_NUMBER.NOTIFICATION_LIST_DROP
    const PAGE_SIZE = 4
    const skip = (page - 1) * PAGE_SIZE


    const result = await getDB().collection(notificationCollectionName).aggregate([
      { $match: {
        workplaceId: ObjectId(workplaceId),
        userTargetId: ObjectId(userId),
        _destroy: false
      } },
      { $skip: skip },
      { $limit: PAGE_SIZE }
    ]).toArray()
    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getFollowingNotifications = async (workplaceId, dataSearch, page) => {
  try {
    // const PAGE_SIZE = ROWS_NUMBER.NOTIFICATION_LIST_DROP // Similar to 'limit'
    const PAGE_SIZE = 4
    const skip = (page - 1) * PAGE_SIZE

    console.log('ownership.cardOrder', dataSearch.cards)


    const result = await getDB().collection(notificationCollectionName).aggregate([
      { $match: {
        workplaceId: ObjectId(workplaceId),
        notificationType: 'board',
        $or: [
          { objectTargetId : { $in : dataSearch.cards } },
          { objectTargetId : { $in : dataSearch.tasks } }
        ],
        _destroy: false
      } },
      { $skip: skip },
      { $limit: PAGE_SIZE }
    ]).toArray()
    return result

  } catch (error) {
    throw new Error(error)
  }
}

export const NotificationModel = {
  createNew,
  update,
  getPersonalNotifications,
  getFollowingNotifications,
  notificationCollectionName
}