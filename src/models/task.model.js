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
  users: Joi.array().items(Joi.object({
    userId: Joi.string().required().min(3).trim().required()
    // Admin role: 1; User role: 0
    // role: Joi.number().integer().min(0).max(1).default(0)
  })).default([]),
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

    console.log('tasks model - insert data', insertValue)

    const result = await getDB().collection(taskCollectionName).insertOne(insertValue)

    console.log('task model - result', result)

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

export const TaskModel = {
  taskCollectionName,
  createNew,
  getOneById,
  deleteMany,
  update,
  getTask,
  checkUserExist,
  addUser
}