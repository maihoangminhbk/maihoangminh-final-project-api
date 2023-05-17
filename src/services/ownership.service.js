import { OwnershipModel } from '*/models/ownership.model'

import { cloneDeep } from 'lodash'
const createNew = async (data) => {
  try {
    const ownership = await OwnershipModel.getOwnershipByUserId(data.userId)
    let result
    if (!ownership) {
      result = await OwnershipModel.createNew(data)
      // const newOwnershipId = result.insertedId

      // await OwnershipModel.getOneById(newOwnershipId)

      const updatedOwnership = await pushWorkplaceOrder(data.userId, data.workplaceId, 0, true)
      return updatedOwnership
    }

    if (ownership && ownership.workplaceOrder.includes(data.workplaceId)) {
      throw new Error('Workplace exist')
    } else {
      throw new Error('Ownership exist')
    }

  } catch (error) {
    throw new Error(error)
  }
}

const addWorkplaceToOwnership = async (data) => {
  const ownership = await OwnershipModel.getOwnershipByUserId(data.userId)

  if (!ownership) {
    throw new Error('Ownership exist')
  }

  const updatedOwnership = await pushWorkplaceOrder(data.userId, data.workplaceId, 0, false)
  return updatedOwnership

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

const pushWorkplaceOrder = async (userId, workplaceId, role, active) => {
  try {

    const updateOwnership = await OwnershipModel.pushWorkplaceOrder(userId, workplaceId, role, active)

    return updateOwnership
  } catch (error) {
    throw new Error(error)
  }
}

const pushBoardOrder = async (userId, boardId, role, active) => {
  try {

    const updateOwnership = await OwnershipModel.pushBoardOrder(userId, boardId, role, active)

    return updateOwnership
  } catch (error) {
    throw new Error(error)
  }
}

const checkWorkplaceAdmin = async (workplaceId, userId) => {
  try {

    const result = await OwnershipModel.checkWorkplaceAdmin(workplaceId, userId)

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const checkBoardAdmin = async (boardId, userId) => {
  try {

    const result = await OwnershipModel.checkBoardAdmin(boardId, userId)

    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const OwnershipService = {
  createNew,
  getOwnershipByUserId,
  update,
  pushWorkplaceOrder,
  addWorkplaceToOwnership,
  pushBoardOrder,
  checkWorkplaceAdmin,
  checkBoardAdmin
}