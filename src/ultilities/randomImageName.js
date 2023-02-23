import crypto from 'crypto'

const randomImageName = (bytes = 32) => (
  crypto.randomBytes(bytes).toString('hex')
)
export default randomImageName