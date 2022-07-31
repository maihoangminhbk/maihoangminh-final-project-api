import Joi from 'joi'
import { getDB } from '*/config/mongodb'
import { ObjectId } from 'mongodb'
// Define card collection
const cardCollectionName = 'cards'
const cardCollectionSchema = Joi.object({
  boardId: Joi.string().required(), // Also ObjectId when create new
  columnId: Joi.string().required(), // Also ObjectId when create new
  title: Joi.string().required().min(3).max(30).trim(),
  cover: Joi.string().default(null),
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
      columnId: ObjectId(validatedValue.columnId)
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

    const result = await getDB().collection(cardCollectionName).findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: insertValue },
      { returnDocument : 'after', returnOriginal : false }
    ).then(
      updatedColumn => {
        console.log(updatedColumn)
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

export const CardModel = {
  cardCollectionName,
  createNew,
  getOneById,
  deleteMany,
  update
}