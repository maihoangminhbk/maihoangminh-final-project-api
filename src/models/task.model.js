import Joi from 'joi'
import { getDB } from '*/config/mongodb'
import { ObjectId } from 'mongodb'
// Define card collection
const taskCollectionName = 'tasks'
const taskCollectionSchema = Joi.object({
  cardId: Joi.string().required(), // Also ObjectId when create new
  title: Joi.string().required().min(3).max(100).trim(),
  complete: Joi.boolean().default(false),
  percent: Joi.number().integer().min(1).max(100).required(),
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
      cardId: ObjectId(validatedValue.cardId)
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

    const result = await getDB().collection(taskCollectionName).findOneAndUpdate(
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

export const TaskModel = {
  taskCollectionName,
  createNew,
  getOneById,
  deleteMany,
  update,
  getTask
}