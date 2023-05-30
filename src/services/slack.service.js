import { SlackModel } from '*/models/card.model'
// import { ColumnModel } from '*/models/column.model'
// import { UserModel } from '*/models/user.model'

// import { OwnershipService } from './ownership.service'
// import { NotificationService } from '*/services/notification.service'

import { HttpStatusCode } from '*/ultilities/constants'
import { env } from '*/config/environment'
import { WebClient } from '@slack/web-api'

import { NotPermission403Error, BadRequest400Error, Conflict409Error } from '../ultilities/errorsHandle/APIErrors'


const auth = async () => {
  try {
    const result = {
      url: env.SLACK_OAUTH_URL
    }

    return result

  } catch (error) {
    throw new Error(error)
  }
}

const callback = async (req) => {
  try {
    const client = new WebClient()

    const response = await client.oauth.v2.access({
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: req.query.code
    })

    const identity = await client.users.identity({
      token: response.authed_user.access_token
    })

    // token = response.access_token
    console.log('respond', response)
    console.log('identity', identity)

    return { ok: 'ok' }

    // token = await JSON.stringify(identity)
    // console.log('token', token)

  } catch (error) {
    throw new Error(error)
  }
}

export const SlackService = {
  auth,
  callback
}