import { ColumnModel } from '*/models/column.model'
import { BoardModel } from '*/models/board.model'
import { ObjectId } from 'mongodb'
import { CardModel } from '*/models/card.model'
const createNew = async (data) => {
  try {
    const result = await ColumnModel.createNew(data)

    const newColumnId = result.insertedId

    const newColumn = await ColumnModel.getOneById(newColumnId)

    newColumn.cards = []

    // Push column to columnOrder in Board Collection
    const boardId = newColumn.boardId.toString()

    await BoardModel.pushColumnOrder(boardId, newColumnId.toString())

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

export const ColumnService = {
  createNew,
  update
}