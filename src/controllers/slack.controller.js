import { SlackService } from '*/services/slack.service'
import { HttpStatusCode } from '*/ultilities/constants'

const auth = async (req, res, next) => {
  try {
    const result = await SlackService.auth()
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const callback = async (req, res, next) => {
  try {
    const result = await SlackService.callback(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}


export const SlackController = {
  auth,
  callback
}