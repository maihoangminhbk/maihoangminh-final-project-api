import { BoardModel } from '*/models/board.model'
import { cloneDeep } from 'lodash'
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
    transformBoard.columns.forEach(column => {
      column.cards = transformBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    // Remove cards from board
    delete transformBoard.cards

    // Sort column by column order, sort card by card order: This step will pass to front-end


    return transformBoard
  } catch (error) {
    throw new Error(error)
  }
}
export const BoardService = {
  createNew,
  getFullBoard
}