import { OwnershipModel } from '*/models/ownership.model'

import { cloneDeep } from 'lodash'
const createNew = async (data) => {
  try {
    const result = await OwnershipModel.createNew(data)

    const newOwnershipId = result.insertedId

    const newOwnership = await OwnershipModel.getOneById(newOwnershipId)

    return newOwnership
  } catch (error) {
    throw new Error(error)
  }
}

const getOwnershipByUserId = async (userId) => {
  try {
    const ownership = await OwnershipModel.getOwnershipByUserId(userId)

    if (!ownership) {
      throw new Error('Owner not found!')
    }

    return ownership
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (userId, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: Date.now()
    }

    if (updateData._id) delete updateData._id

    const updatedOwnership = await OwnershipModel.update(userId, updateData)

    return updatedOwnership
  } catch (error) {
    throw new Error(error)
  }
}

const pushWorkplaceOrder = async (userId, workplaceId) => {
  try {
    const updateOwnership = await OwnershipModel.pushWorkplaceOrder(userId, workplaceId)

    return updateOwnership
  } catch (error) {
    throw new Error(error)
  }
}

export const OwnershipService = {
  createNew,
  getOwnershipByUserId,
  update,
  pushWorkplaceOrder
}