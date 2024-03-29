import { WHITELIST_DOMAINS } from '*/ultilities/constants'
export const corsOptions = {
  origin: function (origin, callback) {
    if (WHITELIST_DOMAINS.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error(`${origin} not allowed by CORS`))
    }
  },
  optionsSuccessStatus: 200
}