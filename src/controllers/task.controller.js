import { TaskService } from '*/services/task.service'
import { HttpStatusCode } from '*/ultilities/constants'


const createNew = async (req, res) => {
  try {
    const result = await TaskService.createNew(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const result = await TaskService.update(id, req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

// const uploadImage = async (req, res) => {
//   try {
//     const { id } = req.params
//     const result = await CardService.uploadImage(req, res)
//   } catch (error) {
//     res.status(HttpStatusCode.INTERNAL_SERVER).json({
//       errors: error.message
//     })
//   }
// }


export const TaskController = {
  createNew,
  update
  // uploadImage
}