import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'
import { OwnershipModel } from './ownership.model'
import { ROWS_NUMBER } from '../ultilities/constants'

// Define board collection
const userCollectionName = 'users'
const userCollectionSchema = Joi.object({
  name: Joi.string().required().min(3).max(100).trim(),
  email: Joi.string().required().min(3).trim(),
  password: Joi.string().required().min(3).trim(),
  active: Joi.boolean().default(false),
  cover: Joi.string().default(null),
  active_code: Joi.string().min(3).trim().default(null),
  reset_code: Joi.string().min(3).trim().default(null),
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
    const value = await validateSchema(data)
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

const getOneById = async (id) => {
  try {

    const result = await getDB().collection(userCollectionName).findOne({ _id: ObjectId(id) })

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const searchUsers = async (workplaceId, keyword, page) => {
  try {
    const PAGE_SIZE = ROWS_NUMBER.USER_LIST_DROPDOWN // Similar to 'limit'
    const skip = (page - 1) * PAGE_SIZE

    const result = await getDB().collection(userCollectionName).aggregate([
      { $match: {
        $or: [
          { name : { $regex : keyword } },
          { email : { $regex : keyword } }
        ],
        // userInfo: { $elemMatch: {
        //   workplaceOrder: { $elemMatch: {
        //     workplaceId: { $ne: ObjectId(workplaceId) }
        //   }
        //   }
        // } },
        _destroy: false
      } },
      { $lookup: {
        from: OwnershipModel.ownershipCollectionName,
        localField: '_id',
        foreignField: 'userId',
        as: 'userInfo'
        // pipeline: [
        //   { $match: {
        //     workplaceOrder: { $elemMatch: {
        //       workplaceId: ObjectId(workplaceId)
        //     }
        //     }
        //   } }
        // ]
      } },
      {
        $match: {
          'userInfo.workplaceOrder.workplaceId': {
            $ne: ObjectId(workplaceId)
          }
        }
      },
      // { $project: {
      //   '_id': 1,
      //   'name': 1,
      //   'email': 1,
      //   'cover': 1
      // } },
      { $skip: skip },
      { $limit: PAGE_SIZE }
    ]).toArray()
    return result

  } catch (error) {
    throw new Error(error)
  }
}

const searchUsersToAddBoard = async (workplaceId, boardId, keyword, page) => {
  try {
    const PAGE_SIZE = ROWS_NUMBER.USER_LIST_DROPDOWN // Similar to 'limit'
    const skip = (page - 1) * PAGE_SIZE

    console.log(workplaceId, boardId, keyword, page)

    const result = await getDB().collection(userCollectionName).aggregate([
      { $match: {
        $or: [
          { name : { $regex : keyword } },
          { email : { $regex : keyword } }
        ],
        _destroy: false
      } },
      { $lookup: {
        from: OwnershipModel.ownershipCollectionName,
        localField: '_id',
        foreignField: 'userId',
        as: 'userInfo'
      } },
      {
        $match: {
          'userInfo.workplaceOrder.workplaceId': ObjectId(workplaceId),
          'userInfo.boardOrder.boardId': {
            $ne: ObjectId(boardId)
          }
        }

      },
      { $project: {
        '_id': 1,
        'name': 1,
        'email': 1,
        'cover': 1
      } },
      { $skip: skip },
      { $limit: PAGE_SIZE }
    ]).toArray()
    return result

  } catch (error) {
    throw new Error(error)
  }
}

const searchUsersToAddCard = async (boardId, cardId, keyword, page) => {
  try {
    const PAGE_SIZE = ROWS_NUMBER.USER_LIST_DROPDOWN // Similar to 'limit'
    const skip = (page - 1) * PAGE_SIZE

    const result = await getDB().collection(userCollectionName).aggregate([
      { $match: {
        $or: [
          { name : { $regex : keyword } },
          { email : { $regex : keyword } }
        ],
        _destroy: false
      } },
      { $lookup: {
        from: OwnershipModel.ownershipCollectionName,
        localField: '_id',
        foreignField: 'userId',
        as: 'userInfo'
      } },
      {
        $match: {
          'userInfo.boardOrder.boardId': ObjectId(boardId),
          'userInfo.cardOrder.cardId': {
            $ne: ObjectId(cardId)
          }
        }

      },
      { $project: {
        '_id': 1,
        'name': 1,
        'email': 1,
        'cover': 1
      } },
      { $skip: skip },
      { $limit: PAGE_SIZE }
    ]).toArray()
    return result

  } catch (error) {
    throw new Error(error)
  }
}

const searchUsersToAddTask = async (cardId, taskId, keyword, page) => {
  try {
    const PAGE_SIZE = ROWS_NUMBER.USER_LIST_DROPDOWN // Similar to 'limit'
    const skip = (page - 1) * PAGE_SIZE

    const result = await getDB().collection(userCollectionName).aggregate([
      { $match: {
        $or: [
          { name : { $regex : keyword } },
          { email : { $regex : keyword } }
        ],
        _destroy: false
      } },
      { $lookup: {
        from: OwnershipModel.ownershipCollectionName,
        localField: '_id',
        foreignField: 'userId',
        as: 'userInfo'
      } },
      {
        $match: {
          'userInfo.cardOrder.cardId': ObjectId(cardId),
          'userInfo.taskOrder.taskId': {
            $ne: ObjectId(taskId)
          }
        }

      },
      { $project: {
        '_id': 1,
        'name': 1,
        'email': 1,
        'cover': 1
      } },
      { $skip: skip },
      { $limit: PAGE_SIZE }
    ]).toArray()
    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getUsersInfoStatistic = async (boardId, keyword, page) => {
  try {
    const PAGE_SIZE = ROWS_NUMBER.USER_LIST_DROPDOWN // Similar to 'limit'
    const skip = (page - 1) * PAGE_SIZE

    const result = await getDB().collection(userCollectionName).aggregate([
      { $match: {
        $or: [
          { name : { $regex : keyword } },
          { email : { $regex : keyword } }
        ],
        _destroy: false
      } },
      { $lookup: {
        from: OwnershipModel.ownershipCollectionName,
        localField: '_id',
        foreignField: 'userId',
        as: 'userInfo'
      } },
      {
        $match: {
          'userInfo.boardOrder.boardId': ObjectId(boardId)
        }
      },
      // { $project: {
      //   '_id': 1,
      //   'name': 1,
      //   'email': 1,
      //   'cover': 1
      // } },
      { $skip: skip },
      { $limit: PAGE_SIZE }
    ]).toArray()
    return result

  } catch (error) {
    throw new Error(error)
  }
}


export const UserModel = {
  getOneByEmail,
  createNew,
  userCollectionName,
  // getFullBoard,
  // pushColumnOrder,
  getOneById,
  searchUsers,
  searchUsersToAddBoard,
  searchUsersToAddCard,
  searchUsersToAddTask,
  getUsersInfoStatistic
  // update
}