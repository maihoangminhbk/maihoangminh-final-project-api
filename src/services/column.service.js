import { ColumnModel } from '*/models/column.model'
import { BoardModel } from '*/models/board.model'
import { ObjectId } from 'mongodb'
import { CardModel } from '*/models/card.model'

import { NotificationService } from '*/services/notification.service'

const createNew = async (userId, data) => {
  try {
    const result = await ColumnModel.createNew(data)

    const newColumnId = result.insertedId

    const newColumn = await ColumnModel.getOneById(newColumnId)

    newColumn.cards = []

    // Push column to columnOrder in Board Collection
    const boardId = newColumn.boardId.toString()

    const board = await BoardModel.getOneById(boardId)

    if (!board) {
      throw new Error('Can not find this board')
    }

    await BoardModel.pushColumnOrder(boardId, newColumnId.toString())
    console.log('check 1')

    const notificationData = {
      workplaceId: board.workplaceId.toString(),
      boardId: board._id.toString(),
      boardTitle: board.title,
      notificationType: 'board',
      userCreateId: userId,
      action: 'created',
      userTargetId: null,
      objectTargetType: 'column',
      objectTargetId: newColumn._id.toString()
    }
    console.log('check 2')

    await NotificationService.createNew(notificationData)
    console.log('check 3')

    return newColumn
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: Date.now()
    }

    if (updateData._id) delete updateData._id
    if (updateData.cards) delete updateData.cards

    const updatedColumn = await ColumnModel.update(id, updateData)

    if (updatedColumn._destroy) {
      CardModel.deleteMany(updatedColumn.cardOrder)
    }
    return updatedColumn
  } catch (error) {
    throw new Error(error)
  }
}

const getBoardId = async (columnId) => {
  try {
    const result = await ColumnModel.getBoardId(columnId)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const ColumnService = {
  createNew,
  update,
  getBoardId
}