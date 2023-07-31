import Joi from 'joi'
import { getDB } from '*/config/mongodb'
import { ObjectId } from 'mongodb'
import { UserModel } from './user.model'
import { OwnershipModel } from './ownership.model'

import { ROWS_NUMBER } from '../ultilities/constants'

// Define card collection
const taskCollectionName = 'tasks'
const taskCollectionSchema = Joi.object({
  cardId: Joi.string().required(), // Also ObjectId when create new
  boardId: Joi.string().required(), // Also ObjectId when create new
  workplaceId: Joi.string().required(), // Also ObjectId when create new
  title: Joi.string().required().min(3).max(100).trim(),
  status: Joi.number().integer().min(0).max(5).default(0), // 0: created; 1: inprocess; 2: done; 3: completed; 4: late; 5: canceled
  percent: Joi.number().integer().min(0).max(100).default(0),
  checked: Joi.boolean().default(false),
  startTime: Joi.date().timestamp().default(null),
  endTime: Joi.date().timestamp().default(null),
  userId: Joi.string().required(),
  users: Joi.array().items(Joi.object({
    userId: Joi.string().required().min(3).trim().required()
    // Admin role: 1; User role: 0
    // role: Joi.number().integer().min(0).max(1).default(0)
  })).default([]),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(Date.now()),
  _destroy: Joi.boolean().default(false)
})


const validateSchema = async (data) => {
  return await taskCollectionSchema.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validatedValue = await validateSchema(data)

    const insertValue = {
      ...validatedValue,
      cardId: ObjectId(validatedValue.cardId),
      boardId: ObjectId(validatedValue.boardId),
      workplaceId: ObjectId(validatedValue.workplaceId),
      userId: ObjectId(validatedValue.userId)
    }


    const result = await getDB().collection(taskCollectionName).insertOne(insertValue)


    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {

    const insertValue = { ...data }

    if (data.cardId) {
      insertValue.cardId = ObjectId(data.cardId)
    }

    if (data.boardId) {
      insertValue.boardId = ObjectId(data.boardId)
    }

    if (data.workplaceId) {
      insertValue.workplaceId = ObjectId(data.workplaceId)
    }

    if (data.userId) {
      insertValue.userId = ObjectId(data.userId)
    }

    const result = await getDB().collection(taskCollectionName).findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: insertValue },
      { returnDocument : 'after', returnOriginal : false }
    ).then(
      updatedTask => {
        return updatedTask
      }
    )

    return result.value

  } catch (error) {
    throw new Error(error)
  }
}

const getTask = async (id) => {
  try {

    const result = await getDB().collection(taskCollectionName).findOne({ _id: ObjectId(id) })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getOneById = async (id) => {
  try {

    const result = await getDB().collection(taskCollectionName).findOne({ _id: id })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getCardId = async (id) => {
  try {

    let result = await getDB().collection(taskCollectionName).findOne({ _id: ObjectId(id) })
    if (result) {
      result = result.cardId.toString()
    }

    return result

  } catch (error) {
    throw new Error(error)
  }
}

/**
 *
 * @param { Array task id } ids
 */
const deleteMany = async (ids) => {
  try {

    const transformIds = ids.map(i => ObjectId(i))
    const result = await getDB().collection(taskCollectionName).updateMany(
      { _id: { $in: transformIds } },
      { $set: { _destroy: true } }
    )
    return result

  } catch (error) {
    throw new Error(error)
  }
}

const checkUserExist = async (taskId, userId) => {
  try {
    const result = await getDB().collection(taskCollectionName).findOne({
      _id: ObjectId(taskId),
      users: { $elemMatch: { userId: ObjectId(userId) } }
    })


    return result

  } catch (error) {
    throw new Error(error)
  }
}

const addUser = async (taskId, data) => {
  try {

    // const validateValue = await validateSchema(data)
    const validateValue = data

    const insertData = { ...validateValue }
    insertData.userId = ObjectId(insertData.userId)

    const result = await getDB().collection(taskCollectionName).findOneAndUpdate(
      { _id: ObjectId(taskId) },
      { $push: { users: insertData } },
      { returnOriginal: false }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const searchUsers = async (taskId, keyword, page) => {
  try {
    // const result = await getDB().collection(workplaceCollectionName).findOne(
    //   { _id: ObjectId(workplaceId) }
    // )
    const PAGE_SIZE = ROWS_NUMBER.USER_LIST_DROPDOWN // Similar to 'limit'
    const skip = (page - 1) * PAGE_SIZE


    const result = await getDB().collection(taskCollectionName).aggregate([
      { $match: {
        _id: ObjectId(taskId)
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

const deleteUser = async (taskId, userId) => {
  try {

    const result = await getDB().collection(taskCollectionName).findOneAndUpdate(
      { _id: ObjectId(taskId) },
      { $pull: { users: { userId: ObjectId(userId) } } },
      { returnOriginal: false }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const getTasksStatusStatistic = async (boardId, startTime, endTime) => {
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

    const result = await getDB().collection(taskCollectionName).aggregate([
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

const getTasksStatusFullStatistic = async (workplaceId) => {
  try {
    const result = await getDB().collection(taskCollectionName).aggregate([
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

const getTaskCount = async (workplaceId) => {
  try {
    const result = await getDB().collection(taskCollectionName).countDocuments(
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

const getTaskCountFromBoard = async (boardId) => {
  try {
    const result = await getDB().collection(taskCollectionName).countDocuments(
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

const getTasksStatusInYearStatistic = async (boardId, year) => {
  try {
    const result = await getDB().collection(taskCollectionName).aggregate([
      { $match: {
        boardId: ObjectId(boardId),
        _destroy: false,
        '$expr': {
          '$eq': [ { '$year': { $toDate: '$startTime' } }, year ]
        }

      }
      },
      { '$group': {
        '_id': {
          'month': { '$month': { $toDate: '$startTime' } },
          'status': '$status'
        },
        'count': { '$sum': 1 }
      } }
    ]).toArray()

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getUsersInfoStatistic = async (boardId, keyword, page) => {
  try {
    const PAGE_SIZE = ROWS_NUMBER.DASHBOARD_USER_LIST // Similar to 'limit'
    const skip = (page - 1) * PAGE_SIZE

    const result = await getDB().collection(taskCollectionName).aggregate([
      { $match: {
        boardId: ObjectId(boardId),
        _destroy: false
      } },
      { $lookup: {
        from: UserModel.userCollectionName,
        localField: 'users.userId',
        foreignField: '_id',
        as: 'userInfo',
        pipeline: [ {
          $sort: { name: 1 }
        }]
      } },
      {
        $addFields: {
          'userInfo.status': '$status'
        }
      },
      // /** Unwind items array, will exclude docs where items is not an array/doesn't exists */
      {
        $unwind: '$userInfo'
      },
      // // /** Replace 'response.items' object as new root(document) */
      {
        $replaceRoot: {
          newRoot: '$userInfo'
        }
      },
      { $match: {
        $or: [
          { name : { $regex : keyword } },
          { email : { $regex : keyword } }
        ],
        _destroy: false
      } },
      { '$group': {
        '_id': {
          'status': '$status',
          'name': '$name',
          'email': '$email',
          'cover': '$cover'
        },
        'taskCount': { '$sum': 1 }
      } },
      { $sort: {
        '_id.email' : 1,
        '_id.status': 1
      }
      },
      { $skip: skip },
      { $limit: PAGE_SIZE }
    ]).toArray()

    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const TaskModel = {
  taskCollectionName,
  createNew,
  getOneById,
  deleteMany,
  update,
  getTask,
  getCardId,
  checkUserExist,
  addUser,
  searchUsers,
  deleteUser,
  getTasksStatusStatistic,
  getTasksStatusFullStatistic,
  getTaskCount,
  getTasksStatusInYearStatistic,
  getTaskCountFromBoard,
  getUsersInfoStatistic
}