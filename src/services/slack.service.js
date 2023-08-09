import { SlackWorkspaceModel } from '*/models/slackWorkspace.model'
import { SlackConnectionModel } from '*/models/slackConnection.model'
import { BoardModel } from '*/models/board.model'
// import { UserModel } from '*/models/user.model'

// import { OwnershipService } from './ownership.service'
// import { NotificationService } from '*/services/notification.service'
import { BadRequest400Error, Conflict409Error, NotPermission403Error } from '../ultilities/errorsHandle/APIErrors'

import { WebClient } from '@slack/web-api'

import { HttpStatusCode } from '*/ultilities/constants'
import { env } from '*/config/environment'

import jwt from 'jsonwebtoken'
import { WorkplaceService } from './workplace.service'

const auth = async (req) => {
  try {
    const { workplaceId } = req.body

    const url = env.SLACK_OAUTH_URL + `&state=${workplaceId}&redirect_uri=${env.SLACK_REDIRECT_URI}`
    // const url = env.SLACK_OAUTH_URL + `&redirect_uri=${env.SLACK_REDIRECT_URI}`

    const result = {
      url: url
    }

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const callback = async (req) => {
  try {
    const client = new WebClient()

    const workplaceId = req.query.state

    if (!workplaceId) {
      throw new Error('Can not find workplaceId')
    }

    const response = await client.oauth.v2.access({
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: req.query.code
    })

    const identity = await client.users.identity({
      token: response.authed_user.access_token
    })

    if (!identity) {
      throw new Error('Can not indentity access token')
    }

    const workspaceData = {
      workplaceId: workplaceId,
      workspaceId: response.team.id,
      title: response.team.name,
      token: response.access_token
    }

    await addToken(workspaceData)

    const return_script = '<script>window.close();</script>'
    return return_script

    // token = await JSON.stringify(identity)
    // console.log('token', token)

  } catch (error) {
    throw new Error(error)
  }
}

const addToken = async (data) => {
  try {
    const checkSlackWorkspaceExist = await SlackWorkspaceModel.getWorkspaceById(data.workspaceId)

    if (checkSlackWorkspaceExist) {
      await SlackWorkspaceModel.update(checkSlackWorkspaceExist._id.toString(), data)
    } else {
      await SlackWorkspaceModel.createNew(data)
    }

    const result = {
      result: 'ok'
    }

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getWorkspace = async (data) => {
  try {
    const { workplaceId } = data

    const workplace = await WorkplaceService.getWorkplace(workplaceId)
    if (!workplace) {
      throw new BadRequest400Error('Workplace not exist')
    }

    const result = await SlackWorkspaceModel.getWorkspaceByWorkplaceId(workplaceId)

    if (!result) {
      // throw new BadRequest400Error('Workplace has not any connect with slack workspace')
      return null
    }

    if (result.token) delete result.token

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const getConnections = async (data) => {
  try {
    const { workplaceId } = data

    const workplace = await WorkplaceService.getWorkplace(workplaceId)
    if (!workplace) {
      throw new BadRequest400Error('Workplace not exist')
    }

    const connections = await SlackConnectionModel.getConnections(workplaceId)

    return connections

  } catch (error) {
    throw new Error(error)
  }
}

const createConnection = async (data) => {
  try {
    const { boardId, workplaceId, slackChannel, slackWorkspaceId } = data

    const workplace = await WorkplaceService.getWorkplace(workplaceId)
    if (!workplace) {
      throw new BadRequest400Error('Workplace not exist')
    }

    const board = await BoardModel.getOneById(boardId)

    if (!board || board.workplaceId.toString() !== workplace._id.toString()) {
      throw new BadRequest400Error('Board not found in workplace')
    }

    const workspace = await SlackWorkspaceModel.getWorkspace(slackWorkspaceId)

    if (!workspace) {
      throw new BadRequest400Error('Workspace not connected')
    }

    const slackChannels = await getSlackChannels(workspace.token)

    let channelId = null

    const channelList = slackChannels.map(channel => {
      if (channel.name && channel.name === slackChannel) {
        if (!channel.is_member) {
          channelId = channel.id
        }
      }

      if (channel.name) {
        return channel.name
      }
    })

    if (channelId) {
      await joinChannel(channelId, workspace.token)
    }

    if (!channelList.includes(slackChannel)) {
      throw new BadRequest400Error('Can not found slack channel')
    }

    const checkExist = await SlackConnectionModel.checkExist(boardId, slackChannel)

    if (checkExist) {
      throw new Conflict409Error('Exist connection')
    }


    const slackConnectionData = {
      ...data,
      boardTitle: board.title
    }

    const connection = await SlackConnectionModel.createNew(slackConnectionData)

    // console.log('connections', connection)

    // Get connections

    const connections = await SlackConnectionModel.getConnections(workplaceId)

    return connections

  } catch (error) {
    throw new Error(error)
  }
}

const getChannels = async (data) => {
  try {
    const { slackWorkspaceId } = data

    const workspace = await SlackWorkspaceModel.getWorkspace(slackWorkspaceId)

    if (!workspace) {
      throw new BadRequest400Error('Workspace not connected')
    }

    const slackChannels = await getSlackChannels(workspace.token)

    const channelList = slackChannels.map(channel => {
      if (channel.name) {
        return channel.name
      }
    })

    return channelList

  } catch (error) {
    throw new Error(error)
  }
}

const getWorkspaceToken = async (workplaceId) => {
  try {
    const workplace = await WorkplaceService.getWorkplace(workplaceId)
    if (!workplace) {
      throw new BadRequest400Error('Workplace not exist')
    }

    const result = await SlackWorkspaceModel.getWorkspaceByWorkplaceId(workplaceId)

    if (!result) {
      return null
    }

    return result.token

  } catch (error) {
    throw new Error(error)
  }
}

const getSlackChannels = async (token) => {
  try {
    const client = new WebClient()

    const response = await client.apiCall('conversations.list', {
      token: token
    })

    if (!response.ok) {
      throw new Error('Cannot get channels in workspace')
    }

    // const channelList = response.channels.map(channel => {
    //   if (channel.name) {
    //     return channel.name
    //   }
    // })

    // console.log('channel list', channelList)

    return response.channels

  } catch (error) {
    throw new Error(error)
  }
}

const joinChannel = async (channelId, token) => {
  try {
    const client = new WebClient()

    const response = await client.apiCall('conversations.join', {
      token: token,
      channel: channelId
    })

    if (!response.ok) {
      throw new Error('Cannot join channel, contact slack admin')
    }

    return response.ok

  } catch (error) {
    throw new Error(error)
  }
}

const postMessage = async (channel, token, notificationData) => {
  try {
    const { notificationType, userCreateName, action, objectTargetName, objectTargetType, boardTitle, boardId, workplaceId } = notificationData
    const client = new WebClient()

    let text = ''

    switch (notificationType) {
    case 'board':
      if (objectTargetType !== 'board') {
        text = `Board: *${boardTitle}* \n`
      }
      text = text + `*${userCreateName}* ${action} ${objectTargetType} *${objectTargetName}*`

      text = text + `\n<https://localhost:3000/workplaces/${workplaceId}/boards/${boardId}|Open App>`
      break

    default:
      break
    }

    const response = await client.apiCall('chat.postMessage', {
      token: token,
      channel: channel,
      blocks: [
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': text
          }
        }
      ],
      text: 'Post notification'
    })

    if (!response.ok) {
      throw new Error('Cannot post message')
    }

    return response.ok

  } catch (error) {
    throw new Error(error)
  }
}

export const SlackService = {
  auth,
  callback,
  addToken,
  getWorkspaceToken,
  getWorkspace,
  getConnections,
  getSlackChannels,
  createConnection,
  getChannels,
  postMessage
}