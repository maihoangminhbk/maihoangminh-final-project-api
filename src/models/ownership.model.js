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
      role: Joi.number().integer().min(0).max(1),
      active: Joi.boolean().default(false)
    })
  ).default([]),
  boardOrder: Joi.array().items(
    Joi.object({
      boardId: Joi.string().required().min(3).trim(),
      role: Joi.number().integer().min(0).max(1),
      active: Joi.boolean().default(false)
    })
  ).default([]),
  cardOrder: Joi.array().items(
    Joi.object({
      boardId: Joi.string().required().min(3).trim()
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
const pushWorkplaceOrder = async (userId, workplaceId, role, active) => {
  try {
    const insert_data = {
      workplaceId: ObjectId(workplaceId),
      role: role,
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

/**
 *
 * @param {string} userId
 * @param {string} boardId
 * @returns
 */
const pushBoardOrder = async (userId, boardId, role, active) => {
  try {
    const insert_data = {
      boardId: ObjectId(boardId),
      role: role,
      active: active
    }

    const result = await getDB().collection(ownershipCollectionName).findOneAndUpdate(
      { userId: ObjectId(userId) },
      { $push: { boardOrder: insert_data } },
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

const checkWorkplaceAdmin = async (workplaceId, userId) => {
  try {
    const result = await getDB().collection(ownershipCollectionName).findOne(
      {
        userId: ObjectId(userId),
        workplaceOrder: { $elemMatch: {
          workplaceId: ObjectId(workplaceId),
          role: 0
        } }
      }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const checkBoardAdmin = async (boardId, userId) => {
  try {
    const result = await getDB().collection(ownershipCollectionName).findOne(
      {
        userId: ObjectId(userId),
        boardOrder: { $elemMatch: {
          boardId: ObjectId(boardId),
          role: 0
        } }
      }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const checkBoardUser = async (boardId, userId) => {
  try {
    const result = await getDB().collection(ownershipCollectionName).findOne(
      {
        userId: ObjectId(userId),
        boardOrder: { $elemMatch: {
          boardId: ObjectId(boardId)
        } }
      }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

/**
 *
 * @param {string} userId
 * @param {string} boardId
 * @returns
 */
const pushCardOrder = async (userId, cardId) => {
  try {
    const insert_data = {
      cardId: ObjectId(cardId)
    }

    const result = await getDB().collection(ownershipCollectionName).findOneAndUpdate(
      { userId: ObjectId(userId) },
      { $push: { cardOrder: insert_data } },
      { returnOriginal: false }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

export const OwnershipModel = {
  createNew,
  getOwnershipByUserId,
  pushWorkplaceOrder,
  getOneById,
  update,
  pushBoardOrder,
  checkWorkplaceAdmin,
  checkBoardAdmin,
  checkBoardUser,
  pushCardOrder
}