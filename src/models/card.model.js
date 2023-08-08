import Joi from 'joi'
import { getDB } from '*/config/mongodb'
import { ObjectId } from 'mongodb'
import { TaskModel } from './task.model'
import { UserModel } from './user.model'
import { NotificationModel } from './notification.model'
import { BoardModel } from './board.model'


import { ROWS_NUMBER } from '../ultilities/constants'

// Define card collection
const cardCollectionName = 'cards'
const cardCollectionSchema = Joi.object({
  workplaceId: Joi.string().required(), // Also ObjectId when create new
  boardId: Joi.string().required(), // Also ObjectId when create new
  columnId: Joi.string().required(), // Also ObjectId when create new
  title: Joi.string().required().min(3).max(100).trim(),
  cover: Joi.string().default(null),
  description: Joi.string().max(1000).trim().default('This is description'),
  status: Joi.number().integer().min(0).max(5).default(0), // 0: created; 1: inprocess; 2: done; 3: completed; 4: late; 5: canceled
  startTime: Joi.date().timestamp().default(null),
  endTime: Joi.date().timestamp().default(null),
  userId: Joi.string().required(),
  users: Joi.array().items(
    Joi.object({
      userId: Joi.string().required().min(3).trim().required()
    // Admin role: 1; User role: 0
    // role: Joi.number().integer().min(0).max(1).default(0)
    })
  ).default([]),
  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(Date.now),
  _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
  return await cardCollectionSchema.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validatedValue = await validateSchema(data)

    const insertValue = {
      ...validatedValue,
      workplaceId: ObjectId(validatedValue.workplaceId),
      boardId: ObjectId(validatedValue.boardId),
      columnId: ObjectId(validatedValue.columnId),
      userId: ObjectId(validatedValue.userId)
    }

    const result = await getDB().collection(cardCollectionName).insertOne(insertValue)

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {

    const insertValue = { ...data }

    if (data.workplaceId) {
      insertValue.workplaceId = ObjectId(data.workplaceId)
    }

    if (data.boardId) {
      insertValue.boardId = ObjectId(data.boardId)
      insertValue.columnId = ObjectId(data.columnId)
    }

    if (data.userId) {
      insertValue.userId = ObjectId(data.userId)
    }

    const result = await getDB().collection(cardCollectionName).findOneAndUpdate(
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

const getCard = async (cardId) => {
  try {

    const result = await getDB().collection(cardCollectionName).aggregate([
      { $match: {
        _id: ObjectId(cardId),
        _destroy: false
      } },
      { $lookup: {
        from: TaskModel.taskCollectionName,
        localField: '_id',
        foreignField: 'cardId',
        as: 'tasks',
        pipeline: [
          { $match: {
            _destroy: false
          } }
        ]
      } }
    ]).toArray()

    return result[0] || {}

  } catch (error) {
    throw new Error(error)
  }
}

const getOneById = async (id) => {
  try {

    const result = await getDB().collection(cardCollectionName).findOne({ _id: ObjectId(id) })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

/**
 *
 * @param { Array card id } ids
 */
const deleteMany = async (ids) => {
  try {

    const transformIds = ids.map(i => ObjectId(i))
    const result = await getDB().collection(cardCollectionName).updateMany(
      { _id: { $in: transformIds } },
      { $set: { _destroy: true } }
    )
    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getBoardId = async (cardId) => {
  try {
    let result = await getDB().collection(cardCollectionName).findOne({ _id: ObjectId(cardId) })

    if (result) {
      result = result.boardId.toString()
    }
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const checkUserExist = async (cardId, userId) => {
  try {
    const result = await getDB().collection(cardCollectionName).findOne({
      _id: ObjectId(cardId),
      users: { $elemMatch: { userId: ObjectId(userId) } }
    })


    return result

  } catch (error) {
    throw new Error(error)
  }
}

const addUser = async (cardId, data) => {
  try {

    // const validateValue = await validateSchema(data)
    const validateValue = data

    const insertData = { ...validateValue }
    insertData.userId = ObjectId(insertData.userId)

    const result = await getDB().collection(cardCollectionName).findOneAndUpdate(
      { _id: ObjectId(cardId) },
      { $push: { users: insertData } },
      { returnOriginal: false }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const searchUsers = async (cardId, keyword, page) => {
  try {
    // const result = await getDB().collection(workplaceCollectionName).findOne(
    //   { _id: ObjectId(workplaceId) }
    // )
    const PAGE_SIZE = ROWS_NUMBER.USER_LIST_DROPDOWN // Similar to 'limit'
    const skip = (page - 1) * PAGE_SIZE


    const result = await getDB().collection(cardCollectionName).aggregate([
      { $match: {
        _id: ObjectId(cardId)
      } },
      { $lookup: {
        from: UserModel.userCollectionName,
        localField: 'users.userId',
        foreignField: '_id',
        as: 'usersInfo',
        pipeline: [
          { $match: {
            $or: [
              { name : { $regex : keyword } },
              { email : { $regex : keyword } }
            ]
          }
          },
          { $project: {
            name: 1,
            email: 1,
            cover: 1
          } },

          { $skip: skip },
          { $limit: PAGE_SIZE }

        ]
      } },
      { $project: {
        'usersInfo': 1
      } }
    ]).toArray()

    let usersInfoList = result[0].usersInfo

    // usersInfoList = usersInfoList.map((user, index) => {
    //   user = { ...user, role: usersRoleList[index].role }
    //   return user
    // })

    return usersInfoList
  } catch (error) {
    throw new Error(error)
  }
}

const deleteUser = async (cardId, userId) => {
  try {

    const result = await getDB().collection(cardCollectionName).findOneAndUpdate(
      { _id: ObjectId(cardId) },
      { $pull: { users: { userId: ObjectId(userId) } } },
      { returnOriginal: false }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const getCalendarCards = async (data) => {
  try {
    const { userId, workplaceId, boardList } = data

    const convertedBoard = boardList.map(boardId => {
      return ObjectId(boardId)
    }
    )

    const result = await getDB().collection(cardCollectionName).find(
      {
        _destroy: false,
        endTime: { $ne : null },
        boardId: { $in: convertedBoard }
      }
    ).toArray()

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getCardCount = async (workplaceId) => {
  try {
    const result = await getDB().collection(cardCollectionName).countDocuments(
      {
        workplaceId: ObjectId(workplaceId),
        _destroy: false
      }
    )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getCardCountFromBoard = async (boardId) => {
  try {
    const result = await getDB().collection(cardCollectionName).countDocuments(
      {
        boardId: ObjectId(boardId),
        _destroy: false
      }
    )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getCardsStatusStatistic = async (boardId, startTime, endTime) => {
  try {

    const matchPattern = { $match: {
      boardId: ObjectId(boardId)
    } }

    if (startTime) {
      matchPattern.$match.startTime = { $gte: startTime }
    }

    if (endTime) {
      matchPattern.$match.endTime = { $lte: endTime }
    }

    const result = await getDB().collection(cardCollectionName).aggregate([
      matchPattern,
      { '$facet': {
        'created': [
          { '$match' : { 'status': 0 } },
          { '$count': 'created' }
        ],
        'inprocess': [
          { '$match' : { 'status': 1 } },
          { '$count': 'inprocess' }
        ],
        'done': [
          { '$match' : { 'status': 2 } },
          { '$count': 'done' }
        ],
        'completed': [
          { '$match' : { 'status': 3 } },
          { '$count': 'completed' }
        ],
        'late': [
          { '$match' : { 'status': 4 } },
          { '$count': 'late' }
        ],
        'cancel': [
          { '$match' : { 'status': 5 } },
          { '$count': 'cancel' }
        ]
      } },
      { '$project': {
        'created': { '$arrayElemAt': ['$created.created', 0] },
        'inprocess': { '$arrayElemAt': ['$inprocess.inprocess', 0] },
        'done': { '$arrayElemAt': ['$done.done', 0] },
        'completed': { '$arrayElemAt': ['$completed.completed', 0] },
        'late': { '$arrayElemAt': ['$late.late', 0] },
        'cancel': { '$arrayElemAt': ['$cancel.cancel', 0] }
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) {
    throw new Error(error)
  }
}

const getCardsStatusFullStatistic = async (workplaceId) => {
  try {
    const result = await getDB().collection(cardCollectionName).aggregate([
      { $match: {
        workplaceId: ObjectId(workplaceId),
        _destroy: false
      }
      },
      { '$facet': {
        'created': [
          { '$match' : { 'status': 0 } },
          { '$count': 'created' }
        ],
        'inprocess': [
          { '$match' : { 'status': 1 } },
          { '$count': 'inprocess' }
        ],
        'done': [
          { '$match' : { 'status': 2 } },
          { '$count': 'done' }
        ],
        'completed': [
          { '$match' : { 'status': 3 } },
          { '$count': 'completed' }
        ],
        'late': [
          { '$match' : { 'status': 4 } },
          { '$count': 'late' }
        ],
        'cancel': [
          { '$match' : { 'status': 5 } },
          { '$count': 'cancel' }
        ]
      } },
      { '$project': {
        'created': { '$arrayElemAt': ['$created.created', 0] },
        'inprocess': { '$arrayElemAt': ['$inprocess.inprocess', 0] },
        'done': { '$arrayElemAt': ['$done.done', 0] },
        'completed': { '$arrayElemAt': ['$completed.completed', 0] },
        'late': { '$arrayElemAt': ['$late.late', 0] },
        'cancel': { '$arrayElemAt': ['$cancel.cancel', 0] }
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) {
    throw new Error(error)
  }
}

const checkCardDeadline = async (afterDay) => {
  try {
    let someDate = new Date()

    let dateResult = someDate.setDate(someDate.getDate() + afterDay)
    dateResult = new Date(dateResult).getTime()
    const result = await getDB().collection(cardCollectionName).aggregate([
      { $match: {
        endTime: { $lte: dateResult },
        status: 1,
        _destroy: false
      } },
      { $lookup: {
        from: NotificationModel.notificationCollectionName,
        localField: '_id',
        foreignField: 'objectTargetId',
        as: 'notification',
        pipeline: [
          { $match: {
            notificationType: 'deadline',
            _destroy: false
          } }
        ]
      } },
      { $match: {
        $or: [
          { notification:  { $exists: false } },
          { notification:  { $eq: [] } }
        ]
      } },
      { $lookup: {
        from: UserModel.userCollectionName,
        localField: 'userId',
        foreignField: '_id',
        as: 'usersInfo'
      } },
      { $lookup: {
        from: BoardModel.boardCollectionName,
        localField: 'boardId',
        foreignField: '_id',
        as: 'boardInfo'
      } }
    ]).toArray()

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const checkCardLate = async (afterDay) => {
  try {
    let someDate = new Date()

    let dateResult = someDate.setDate(someDate.getDate() + afterDay)
    dateResult = new Date(dateResult).getTime()
    const result = await getDB().collection(cardCollectionName).aggregate([
      { $match: {
        endTime: { $lte: dateResult },
        status: 1,
        _destroy: false
      } },
      { $lookup: {
        from: UserModel.userCollectionName,
        localField: 'userId',
        foreignField: '_id',
        as: 'usersInfo'
      } },
      { $lookup: {
        from: BoardModel.boardCollectionName,
        localField: 'boardId',
        foreignField: '_id',
        as: 'boardInfo'
      } }
    ]).toArray()

    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const CardModel = {
  cardCollectionName,
  createNew,
  getOneById,
  deleteMany,
  update,
  getCard,
  getBoardId,
  checkUserExist,
  addUser,
  searchUsers,
  deleteUser,
  getCalendarCards,
  getCardCount,
  getCardsStatusStatistic,
  getCardsStatusFullStatistic,
  getCardCountFromBoard,
  checkCardDeadline,
  checkCardLate
}