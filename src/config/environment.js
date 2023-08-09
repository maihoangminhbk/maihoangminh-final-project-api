require('dotenv').config()

export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  APP_HOST: process.env.APP_HOST,
  PORT: process.env.PORT,
  DATABASE_NAME: process.env.DATABASE_NAME,

  SESSION_SECRET: process.env.SESSION_SECRET,

  MAILER_USER: process.env.MAILER_USER,
  MAILER_PASSWORD: process.env.MAILER_PASSWORD,

  SOCKET_HOST: process.env.SOCKET_HOST,

  SLACK_OAUTH_URL: process.env.SLACK_OAUTH_URL,
  SLACK_REDIRECT_URI: process.env.SLACK_REDIRECT_URI,

  FRONTEND_HOST: process.env.FRONTEND_HOST
}