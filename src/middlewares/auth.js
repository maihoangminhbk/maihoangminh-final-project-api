import jwt from 'jsonwebtoken'
import { HttpStatusCode } from '*/ultilities/constants'
import { env } from '*/config/environment'
const secret = process.env.JWT_SECRET

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const isCustomAuth = token.length < 500

    let decodedData
    console.log('auth - auth - token', token)
    if (token && isCustomAuth) {
      console.log('middleware - auth - test token: TH 1', secret)
      decodedData = jwt.verify(token, secret)
      console.log('middleware - auth - test token: TH 1 pass')
      req.params.userId = decodedData?.id
      console.log('middleware - auth - userId', req.params.userId)
    } else {
      console.log('middleware - auth - test token: TH 2')
      decodedData = jwt.verify(token, secret)
      decodedData = jwt.decode(token)

      req.userId = decodedData?.sub
    }

    next()
  } catch (error) {
    res.status(HttpStatusCode.UNAUTHORIZED).json({
      errors: error.message,
      token_error: true
    })
  }
}

export default auth
