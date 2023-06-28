import Joi from 'joi'
import { getDB } from '*/config/mongodb'
import { ObjectId } from 'mongodb'
import { TaskModel } from './task.model'
// Define card collection
const notificationCollectionName = 'notifications'
const notificationCollectionSchema = Joi.object({
  userCreateId: Joi.string().required(),
  userCreateName: Joi.string().required().min(3).max(100).trim(),
  userCreateAvatar: Joi.string().default(null),
  action: Joi.string().required().valid('created', 'updated', 'removed', 'added'),
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
      userCreateId: ObjectId(validatedValue.userCreateId),
      objectTargetId: ObjectId(validatedValue.objectTargetId)
    }

    if (insertValue.userTargetId) {
      insertValue.userTargetId = ObjectId(validatedValue.userTargetId)
    }

    const result = await getDB().collection(notificationCollectionName).insertOne(insertValue)

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {

    const insertValue = {
      ...data,
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

// const getCard = async (cardId) => {
//   try {

//     const result = await getDB().collection(cardCollectionName).aggregate([
//       { $match: {
//         _id: ObjectId(cardId),
//         _destroy: false
//       } },
//       { $lookup: {
//         from: TaskModel.taskCollectionName,
//         localField: '_id',
//         foreignField: 'cardId',
//         as: 'tasks' } }
//     ]).toArray()

//     return result[0] || {}

//   } catch (error) {
//     throw new Error(error)
//   }
// }

// const getOneById = async (id) => {
//   try {

//     const result = await getDB().collection(cardCollectionName).findOne({ _id: id })

//     return result

//   } catch (error) {
//     throw new Error(error)
//   }
// }

// /**
//  *
//  * @param { Array card id } ids
//  */
// const deleteMany = async (ids) => {
//   try {

//     const transformIds = ids.map(i => ObjectId(i))
//     const result = await getDB().collection(cardCollectionName).updateMany(
//       { _id: { $in: transformIds } },
//       { $set: { _destroy: true } }
//     )
//     return result

//   } catch (error) {
//     throw new Error(error)
//   }
// }

// const getBoardId = async (cardId) => {
//   try {
//     let result = await getDB().collection(cardCollectionName).findOne({ _id: ObjectId(cardId) })

//     if (result) {
//       result = result.boardId.toString()
//     }
//     return result
//   } catch (error) {
//     throw new Error(error)
//   }
// }

// const checkUserExist = async (cardId, userId) => {
//   try {
//     const result = await getDB().collection(cardCollectionName).findOne({
//       _id: ObjectId(cardId),
//       users: { $elemMatch: { userId: ObjectId(userId) } }
//     })


//     return result

//   } catch (error) {
//     throw new Error(error)
//   }
// }

// const addUser = async (cardId, data) => {
//   try {

//     // const validateValue = await validateSchema(data)
//     const validateValue = data

//     const insertData = { ...validateValue }
//     insertData.userId = ObjectId(insertData.userId)

//     const result = await getDB().collection(cardCollectionName).findOneAndUpdate(
//       { _id: ObjectId(cardId) },
//       { $push: { users: insertData } },
//       { returnOriginal: false }
//     )

//     return result.value
//   } catch (error) {
//     throw new Error(error)
//   }
// }

export const NotificationModel = {
  // cardCollectionName,
  createNew,
  // getOneById,
  // deleteMany,
  update
  // getCard,
  // getBoardId,
  // checkUserExist,
  // addUser
}