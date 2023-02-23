import { BoardModel } from '*/models/board.model'
import { cloneDeep } from 'lodash'
import { CardService } from '*/services/card.service'

const createNew = async (data) => {
  try {
    const result = await BoardModel.createNew(data)

    const newBoardId = result.insertedId

    const newBoard = await BoardModel.getOneById(newBoardId)

    newBoard.columns = []

    return newBoard
  } catch (error) {
    throw new Error(error)
  }
}

const getFullBoard = async (boardId) => {
  try {
    const board = await BoardModel.getFullBoard(boardId)

    if (!board || !board.columns) {
      throw new Error('Board not found!')
    }

    const transformBoard = cloneDeep(board)
    // Filter deleted columns
    transformBoard.columns = transformBoard.columns.filter(column => !column._destroy)

    // Add card to each column


    for (let column of transformBoard.columns) {
      column.cards = transformBoard.cards.filter(card => card.columnId.toString() === column._id.toString())

      for (let card of column.cards) {
        const url = await CardService.getImageUrl(card.cover)

        card.imageUrl = url
      }
    }

    // await column.cards.forEach(async card => {
    //   console.log('board service test')
    //   console.log('card.cover', card.cover)
    //   const url = await CardService.getImageUrl(card.cover).then(() => {
    //     card.imageUrl = url
    //   })
    //   console.log('card.imageUrl', card.imageUrl)

    // })

    // Remove cards from board
    delete transformBoard.cards

    // Sort column by column order, sort card by card order: This step will pass to front-end
    console.log('transformBoard.columns.cards', transformBoard.columns[0].cards)

    return transformBoard
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
    if (updateData.columns) delete updateData.columns

    const updatedBoard = await BoardModel.update(id, updateData)

    return updatedBoard
  } catch (error) {
    throw new Error(error)
  }
}

export const BoardService = {
  createNew,
  getFullBoard,
  update
}