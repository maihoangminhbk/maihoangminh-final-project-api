import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'
import { ColumnModel } from './column.model'
import { CardModel } from './card.model'
import { UserModel } from './user.model'

// Define board collection
const slackCollectionName = 'slackWorkspace'
const slackCollectionSchema = Joi.object({
  title: Joi.string().required().min(3).max(100).trim(),
  workspaceId: Joi.string().required().min(3).trim(),
  workplaceId: Joi.string().required().min(3).trim(),
  token: Joi.string().required().min(3).trim(),
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
      workplaceId: ObjectId(validatedValue.workplaceId)
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

const getWorkspaceById = async (workspaceId) => {
  try {

    const result = await getDB().collection(slackCollectionName).findOne({ workspaceId: workspaceId })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getWorkspace = async (slackWorkspaceId) => {
  try {

    const result = await getDB().collection(slackCollectionName).findOne({ _id: ObjectId(slackWorkspaceId) })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getWorkspaceByWorkplaceId = async (workplaceId) => {
  try {

    const result = await getDB().collection(slackCollectionName).findOne({ workplaceId: ObjectId(workplaceId) })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

export const SlackWorkspaceModel = {
  createNew,
  update,
  getWorkspace,
  getWorkspaceById,
  getWorkspaceByWorkplaceId
}