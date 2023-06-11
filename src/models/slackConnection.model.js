import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'
import { ColumnModel } from './column.model'
import { CardModel } from './card.model'
import { UserModel } from './user.model'

// Define board collection
const slackCollectionName = 'slackConnection'
const slackCollectionSchema = Joi.object({
  boardId: Joi.string().required().min(3).trim(),
  boardTitle: Joi.string().required().min(3).max(100).trim(),
  workplaceId: Joi.string().required().min(3).trim(),
  slackChannel: Joi.string().required().min(3).trim(),
  slackWorkspaceId: Joi.string().required().min(3).trim(),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(Date.now()),
  _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
  return await slackCollectionSchema.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validatedValue = await validateSchema(data)

    const insertValue = {
      ...validatedValue,
      workplaceId: ObjectId(validatedValue.workplaceId),
      slackWorkspaceId: ObjectId(validatedValue.slackWorkspaceId),
      boardId: ObjectId(validatedValue.boardId)
    }

    const result = await getDB().collection(slackCollectionName).insertOne(insertValue)
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

    if (insertValue.slackWorkspaceId) {
      insertValue.slackWorkspaceId = ObjectId(insertValue.slackWorkspaceId)
    }

    if (insertValue.boardId) {
      insertValue.boardId = ObjectId(insertValue.boardId)
    }

    const result = await getDB().collection(slackCollectionName).findOneAndUpdate(
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

const getConnectionBySlackWorkspaceId = async (slackWorkspaceId) => {
  try {

    const result = await getDB().collection(slackCollectionName).findOne({ slackWorkspaceId: slackWorkspaceId })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getConnection = async (id) => {
  try {

    const result = await getDB().collection(slackCollectionName).findOne({ _id: ObjectId(id) })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getConnections = async (workplaceId) => {
  try {

    const result = await getDB().collection(slackCollectionName).find({ workplaceId: ObjectId(workplaceId) }).toArray()

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const checkExist = async (boardId, slackChannel) => {
  try {

    const result = await getDB().collection(slackCollectionName).findOne({
      boardId: ObjectId(boardId),
      slackChannel: slackChannel
    })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

export const SlackConnectionModel = {
  createNew,
  update,
  getConnection,
  getConnectionBySlackWorkspaceId,
  checkExist,
  getConnections
}