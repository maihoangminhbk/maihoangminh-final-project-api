import { BoardService } from '*/services/board.service'
import { HttpStatusCode } from '*/ultilities/constants'


const createNew = async (req, res) => {
  try {
    const result = await BoardService.createNew(req.body)
    console.log(result)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const getFullBoard = async (req, res) => {
  try {
    const { id } = req.params
    const result = await BoardService.getFullBoard(id)
    console.log(result)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}


export const BoardController = {
  createNew,
  getFullBoard
}