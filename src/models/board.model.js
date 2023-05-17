import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'
import { ColumnModel } from './column.model'
import { CardModel } from './card.model'
import { UserModel } from './user.model'

// Define board collection
const boardCollectionName = 'boards'
const boardCollectionSchema = Joi.object({
  title: Joi.string().required().min(3).max(20).trim(),
  workplaceId: Joi.string().required().min(3).trim(),
  userId: Joi.string().required().min(3).trim(),
  users: Joi.array().items(Joi.object({
    userId: Joi.string().required().min(3).trim().required(),
    // Admin role: 1; User role: 0
    role: Joi.number().integer().min(0).max(1).default(0)
  })).default([]),
  columnOrder: Joi.array().items(Joi.string()).default([]),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(Date.now()),
  _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
  return await boardCollectionSchema.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validatedValue = await validateSchema(data)
    const insertValue = {
      ...validatedValue,
      workplaceId: ObjectId(validatedValue.workplaceId),
      userId: ObjectId(validatedValue.userId)
    }
    const result = await getDB().collection(boardCollectionName).insertOne(insertValue)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {

    const insertValue = { ...data }

    if (insertValue.workplaceId) {
      insertValue.workplaceId = ObjectId(insertValue.workplaceId)
    }

    const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
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

const getOneById = async (id) => {
  try {

    const result = await getDB().collection(boardCollectionName).findOne({ _id: id })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

/**
 *
 * @param {string} boardId
 * @param {string} columnId
 * @returns
 */
const pushColumnOrder = async (boardId, columnId) => {
  try {
    const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
      { _id: ObjectId(boardId) },
      { $push: { columnOrder: columnId } },
      { returnOriginal: false }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const getFullBoard = async (boardId) => {
  try {
    const result = await getDB().collection(boardCollectionName).aggregate([
      { $match: {
        _id: ObjectId(boardId),
        _destroy: false
      } },
      { $lookup: {
        from: ColumnModel.columnCollectionName,
        localField: '_id',
        foreignField: 'boardId',
        as: 'columns' } },
      { $lookup: {
        from: CardModel.cardCollectionName,
        localField: '_id',
        foreignField: 'boardId',
        as: 'cards' } }
    ]).toArray()

    return result[0] || {}
  } catch (error) {
    throw new Error(error)
  }
}

const checkUserExist = async (boardId, userId) => {
  try {
    const result = await getDB().collection(boardCollectionName).findOne({
      _id: ObjectId(boardId),
      users: { $elemMatch: { userId: ObjectId(userId) } }
    })


    return result

  } catch (error) {
    throw new Error(error)
  }
}


const addUser = async (boardId, data) => {
  try {

    // const validateValue = await validateSchema(data)
    const validateValue = data

    const insertData = { ...validateValue }
    insertData.userId = ObjectId(insertData.userId)

    const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
      { _id: ObjectId(boardId) },
      { $push: { users: insertData } },
      { returnOriginal: false }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const getUsers = async (workplaceId) => {
  try {
    // const result = await getDB().collection(workplaceCollectionName).findOne(
    //   { _id: ObjectId(workplaceId) }
    // )


    const result = await getDB().collection(boardCollectionName).aggregate([
      { $match: {
        _id: ObjectId(workplaceId)
      } },
      { $lookup: {
        from: UserModel.userCollectionName,
        localField: 'users.userId',
        foreignField: '_id',
        as: 'usersInfo',
        pipeline: [
          { $project: {
            name: 1,
            email: 1,
            cover: 1
          } }
        ]
      } },
      { $project: {
        'usersInfo': 1,
        'users.role' : 1
      } }
    ]).toArray()


    const usersRoleList = result[0].users
    let usersInfoList = result[0].usersInfo
    usersInfoList = usersInfoList.map((user, index) => {
      user = { ...user, role: usersRoleList[index].role }
      return user
    })

    return usersInfoList
  } catch (error) {
    throw new Error(error)
  }
}

const getOneByOwnerAndId = async (boardId, userId) => {
  try {
    const result = await getDB().collection(boardCollectionName).findOne({ _id: ObjectId(boardId), userId: ObjectId(userId) })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const BoardModel = {
  createNew,
  getFullBoard,
  pushColumnOrder,
  getOneById,
  update,
  checkUserExist,
  addUser,
  getUsers,
  getOneByOwnerAndId
}