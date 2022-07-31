import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'

// Define workplace collection
const workplaceCollectionName = 'workplaces'
const workplaceCollectionSchema = Joi.object({
  userId: Joi.string().required().min(3).trim(),
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

const validateSchema = async (data) => {
  return await workplaceCollectionSchema.validateAsync(data, { abortEarly: false })
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
        console.log(updatedOwnership)
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

/**
 *
 * @param {string} workplaceId
 * @param {string} boardId
 * @returns
 */
const pushBoardOrder = async (workplaceId, board) => {
  try {
    const result = await getDB().collection(workplaceCollectionName).findOneAndUpdate(
      { _id: ObjectId(workplaceId) },
      { $push: { boardOrder: board } },
      { returnOriginal: false }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

// const getWorkplace = async (boardId) => {
//   try {
//     const result = await getDB().collection(workplaceCollectionName).aggregate([
//       { $match: {
//         _id: ObjectId(boardId),
//         _destroy: false
//       } },
//       { $lookup: {
//         from: ColumnModel.columnCollectionName,
//         localField: '_id',
//         foreignField: 'workplaceId',
//         as: 'boards' } }
//     ]).toArray()

//     console.log(result)
//     return result[0] || {}
//   } catch (error) {
//     throw new Error(error)
//   }
// }

export const WorkplaceModel = {
  createNew,
  // getFullBoard,
  pushBoardOrder,
  getOneById,
  update
}