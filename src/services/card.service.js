import { CardModel } from '*/models/card.model'
import { ColumnModel } from '*/models/column.model'

const createNew = async (data) => {
  try {
    const result = await CardModel.createNew(data)
    const newCardId = result.insertedId

    console.log(newCardId)

    const newCard = await CardModel.getOneById(newCardId)
    console.log(newCard)
    // Push card id to card order in column collection
    const columnId = newCard.columnId
    await ColumnModel.pushCardOrder(columnId, newCardId)

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

    if (updateData._id) delete updateData._id

    const updatedCard = await CardModel.update(id, updateData)

    return updatedCard
  } catch (error) {
    throw new Error(error)
  }
}

export const CardService = {
  createNew,
  update
}