import Joi from 'joi'
import { getDB } from '*/config/mongodb'
import { ObjectId } from 'mongodb'
import { TaskModel } from './task.model'
// Define card collection
const cardCollectionName = 'cards'
const cardCollectionSchema = Joi.object({
  boardId: Joi.string().required(), // Also ObjectId when create new
  columnId: Joi.string().required(), // Also ObjectId when create new
  title: Joi.string().required().min(3).max(30).trim(),
  cover: Joi.string().default(null),
  description: Joi.string().max(1000).trim().default('This is description'),
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
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(Date.now()),
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
        as: 'tasks' } }
    ]).toArray()

    return result[0] || {}

  } catch (error) {
    throw new Error(error)
  }
}

const getOneById = async (id) => {
  try {

    const result = await getDB().collection(cardCollectionName).findOne({ _id: id })

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
  getCalendarCards
}