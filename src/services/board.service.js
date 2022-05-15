import { BoardModel } from '*/models/board.model'
const createNew = async (data) => {
  try {
    const result = await BoardModel.createNew(data)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getFullBoard = async (boardId) => {
  try {
    const board = await BoardModel.getFullBoard(boardId)

    // Add card to each column
    board.columns.forEach(column => {
      column.cards = board.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    // Remove cards from board
    delete board.cards

    // Sort column by column order, sort card by card order: This step will pass to front-end


    return board
  } catch (error) {
    throw new Error(error)
  }
}
export const BoardService = {
  createNew,
  getFullBoard
}