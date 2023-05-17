import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'
import { UserModel } from '*/models/user.model'

// Define workplace collection
const workplaceCollectionName = 'workplaces'
const workplaceCollectionSchema = Joi.object({
  userId: Joi.string().required().min(3).trim(),
  users: Joi.array().items(Joi.object({
    userId: Joi.string().required().min(3).trim().required(),
    // Admin role: 1; User role: 0
    role: Joi.number().integer().min(0).max(1).default(0)
  })).default([]),
  title: Joi.string().required().min(3).max(20).trim(),
  cover: Joi.string().default(null),
  boardOrder: Joi.array().items(Joi.object({
    boardId: Joi.string().required().min(3).trim(),
    title: Joi.string().required().min(3).max(20).trim()
  }
  )).default([]),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(Date.now()),
  _destroy: Joi.boolean().default(false)
})

const permissionCollectionSchema = Joi.object({
  userId: Joi.string().required().min(3).trim().required(),
  // Admin role: 1; User role: 0
  role: Joi.number().integer().min(0).max(1).default(0)
})

const validateSchema = async (data) => {
  return await workplaceCollectionSchema.validateAsync(data, { abortEarly: false })
}

const validatePermissionCollectionSchema = async (data) => {
  return await permissionCollectionSchema.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validatedValue = await validateSchema(data)

    const insertValue = {
      ...validatedValue,
      userId: ObjectId(validatedValue.userId)
    }

    const result = await getDB().collection(workplaceCollectionName).insertOne(insertValue)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {

    const insertValue = { ...data }

    const result = await getDB().collection(workplaceCollectionName).findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: insertValue },
      { returnDocument : 'after', returnOriginal : false }
    ).then(
      updatedOwnership => {
        return updatedOwnership
      }
    )

    return result.value

  } catch (error) {
    throw new Error(error)
  }
}

const getOneById = async (id) => {
  try {

    const result = await getDB().collection(workplaceCollectionName).findOne({ _id: ObjectId(id) })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getOneByOwnerAndId = async (workplaceId, userId) => {
  try {
    const result = await getDB().collection(workplaceCollectionName).findOne({ _id: ObjectId(workplaceId), userId: ObjectId(userId) })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const checkUserExist = async (workplaceId, userId) => {
  try {
    const result = await getDB().collection(workplaceCollectionName).findOne({
      _id: ObjectId(workplaceId),
      users: { $elemMatch: {
        userId: ObjectId(userId),
        // role: 1
      } }
    })


    return result

  } catch (error) {
    throw new Error(error)
  }
}

const addUser = async (workplaceId, data) => {
  try {

    const validateValue = await validatePermissionCollectionSchema(data)

    const insertData = { ...validateValue }
    insertData.userId = ObjectId(insertData.userId)

    const result = await getDB().collection(workplaceCollectionName).findOneAndUpdate(
      { _id: ObjectId(workplaceId) },
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


    const result = await getDB().collection(workplaceCollectionName).aggregate([
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

/**
 *
 * @param {string} workplaceId
 * @param {string} boardId
 * @returns
 */
const pushBoardOrder = async (workplaceId, board) => {
  try {
    const insertBoard = {
      ...board,
      boardId: ObjectId(board.boardId),
      workplaceId: ObjectId(board.workplaceId),
      userId: ObjectId(board.userId)
    }

    const result = await getDB().collection(workplaceCollectionName).findOneAndUpdate(
      { _id: ObjectId(workplaceId) },
      { $push: { boardOrder: insertBoard } },
      { returnOriginal: false }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

// const checkWorkplaceAdmin = async(workplaceId, userId) => {
//   try {
//     const result = await getDB().collection(workplaceCollectionName).findOne({
//       _id: ObjectId(workplaceId),
//       userId: { $elemMatch: { userId: ObjectId(userId) } }
//     })


//     return result
//   } catch (error) {
//     throw new Error(error)
//   }
// }

export const WorkplaceModel = {
  createNew,
  // getFullBoard,
  pushBoardOrder,
  getOneById,
  update,
  getOneByOwnerAndId,
  addUser,
  checkUserExist,
  getUsers
  // checkWorkplaceAdmin
}