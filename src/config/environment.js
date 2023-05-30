require('dotenv').config()

export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,
  DATABASE_NAME: process.env.DATABASE_NAME,

  MAILER_USER: process.env.MAILER_USER,
  MAILER_PASSWORD: process.env.MAILER_PASSWORD,

  SOCKET_HOST: process.env.SOCKET_HOST,

  SLACK_OAUTH_URL: process.env.SLACK_OAUTH_URL
}