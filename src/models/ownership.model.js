import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'

// Define board collection
const ownershipCollectionName = 'ownership'
const ownershipCollectionSchema = Joi.object({
  userId: Joi.string().required().min(3).trim(),
  workplaceOrder: Joi.array().items(
    Joi.object({
      workplaceId: Joi.string().required().min(3).trim(),
      active: Joi.boolean().default(false)
    })
  ).default([]),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(Date.now()),
  _destroy: Joi.boolean().default(false)
})

const validateSchema = async (data) => {
  return await ownershipCollectionSchema.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {

    let validateValue = {
      ...data
    }
    if (validateValue.workplaceId) delete validateValue.workplaceId

    validateValue = await validateSchema(validateValue)

    const insertValue = {
      ...validateValue,
      userId: ObjectId(data.userId)
    }



    const result = await getDB().collection(ownershipCollectionName).insertOne(insertValue)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (userId, data) => {
  try {

    const insertValue = { ...data }

    const result = await getDB().collection(ownershipCollectionName).findOneAndUpdate(
      { _id: ObjectId(userId) },
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

    const result = await getDB().collection(ownershipCollectionName).findOne({ _id: id })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

/**
 *
 * @param {string} boardId
 * @param {string} workplaceId
 * @returns
 */
const pushWorkplaceOrder = async (userId, workplaceId, active) => {
  try {
    const insert_data = {
      workplaceId: ObjectId(workplaceId),
      active: active
    }

    const result = await getDB().collection(ownershipCollectionName).findOneAndUpdate(
      { userId: ObjectId(userId) },
      { $push: { workplaceOrder: insert_data } },
      { returnOriginal: false }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const getOwnershipByUserId = async (userId) => {
  try {
    const result = await getDB().collection(ownershipCollectionName).findOne({ userId: ObjectId(userId) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const OwnershipModel = {
  createNew,
  getOwnershipByUserId,
  pushWorkplaceOrder,
  getOneById,
  update
}