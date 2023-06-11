import { SlackService } from '*/services/slack.service'
import { HttpStatusCode } from '*/ultilities/constants'

const auth = async (req, res, next) => {
  try {
    const result = await SlackService.auth(req)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const callback = async (req, res, next) => {
  try {
    const result = await SlackService.callback(req)
    res.send(result)
  } catch (error) {
    next(error)
  }
}

const getWorkspace = async (req, res, next) => {
  try {
    const result = await SlackService.getWorkspace(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const createConnection = async (req, res, next) => {
  try {
    const result = await SlackService.createConnection(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateConnections = async (req, res, next) => {
  try {
    const result = await SlackService.updateConnections(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getConnections = async (req, res, next) => {
  try {
    const result = await SlackService.getConnections(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateConnection = async (req, res, next) => {
  try {
    const { id } = req.params
    const { data } = req.body

    const result = await SlackService.updateConnection(id, data)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getChannels = async (req, res, next) => {
  try {
    const result = await SlackService.getChannels(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    next(error)
  }
}


export const SlackController = {
  auth,
  callback,
  getWorkspace,
  getConnections,
  updateConnections,
  createConnection,
  updateConnection,
  getChannels
}