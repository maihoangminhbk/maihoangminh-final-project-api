import { CardModel } from '*/models/card.model'
import { ColumnModel } from '*/models/column.model'

const createNew = async (data) => {
  try {
    const newCard = await CardModel.createNew(data)
    console.log(newCard)
    // Push card id to card order in column collection
    const columnId = newCard.columnId
    const cardId = newCard.insertedId
    await ColumnModel.pushCardOrder(columnId, cardId)

    return newCard
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

    const result = await CardModel.update(id, updateData)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const CardService = {
  createNew,
  update
}