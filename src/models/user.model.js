import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'

// Define board collection
const userCollectionName = 'users'
const userCollectionSchema = Joi.object({
  name: Joi.string().required().min(3).max(40).trim(),
  email: Joi.string().required().min(3).trim(),
  password: Joi.string().required().min(3).trim(),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(Date.now()),
  _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
  return await userCollectionSchema.validateAsync(data, { abortEarly: false })
}

const getOneByEmail = async (email) => {
  try {
    // const value = await validateSchema(data)
    // console.log(value)
    const result = await getDB().collection(userCollectionName).findOne({ 'email' : email })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const createNew = async (data) => {
  try {
    console.log('usermodel createNew data', data)
    const value = await validateSchema(data)
    console.log('usermodel createNew value', value)
    const result = await getDB().collection(userCollectionName).insertOne(value)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// const update = async (id, data) => {
//   try {

//     const insertValue = { ...data }

//     const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
//       { _id: ObjectId(id) },
//       { $set: insertValue },
//       { returnDocument : 'after', returnOriginal : false }
//     ).then(
//       updatedColumn => {
//         console.log(updatedColumn)
//         return updatedColumn
//       }
//     )

//     return result.value

//   } catch (error) {
//     throw new Error(error)
//   }
// }

// const getOneById = async (id) => {
//   try {

//     const result = await getDB().collection(boardCollectionName).findOne({ _id: id })

//     return result

//   } catch (error) {
//     throw new Error(error)
//   }
// }

// /**
//  *
//  * @param {string} boardId
//  * @param {string} columnId
//  * @returns
//  */
// const pushColumnOrder = async (boardId, columnId) => {
//   try {
//     const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
//       { _id: ObjectId(boardId) },
//       { $push: { columnOrder: columnId } },
//       { returnOriginal: false }
//     )

//     return result.value
//   } catch (error) {
//     throw new Error(error)
//   }
// }

// const getFullBoard = async (boardId) => {
//   try {
//     const result = await getDB().collection(boardCollectionName).aggregate([
//       { $match: { 
//         _id: ObjectId(boardId),
//         _destroy: false
//       } },
//       { $lookup: {
//         from: ColumnModel.columnCollectionName,
//         localField: '_id',
//         foreignField: 'boardId',
//         as: 'columns' } },
//       { $lookup: {
//         from: CardModel.cardCollectionName,
//         localField: '_id',
//         foreignField: 'boardId',
//         as: 'cards' } }
//     ]).toArray()

//     console.log(result)
//     return result[0] || {}
//   } catch (error) {
//     throw new Error(error)
//   }
// }

export const UserModel = {
  getOneByEmail,
  createNew
  // getFullBoard,
  // pushColumnOrder,
  // getOneById,
  // update
}