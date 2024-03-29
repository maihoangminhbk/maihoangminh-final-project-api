import { UserModel } from '*/models/user.model'

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { WorkplaceService } from '*/services/workplace.service'
import { OwnershipService } from '*/services/ownership.service'

import { makeId } from '*/ultilities/randomId'

import SENDMAIL, { setOptions } from '*/mailer/mailer.js'

import { Conflict409Error, Unauthorized401Error } from '*/ultilities/errorsHandle/APIErrors'

const secret = process.env.JWT_SECRET

const login = async (data) => {
  const { email, password } = data


  const oldUser = await UserModel.getOneByEmail(email)

  if (!oldUser) {
    throw new Unauthorized401Error('User doesn\'t exist')
  }

  if (!oldUser.active) {
    throw new Unauthorized401Error('Account not activate, please check your email or sign up again')
  }

  const isPasswordCorrect = await bcrypt.compare(password, oldUser.password)

  if (!isPasswordCorrect) {
    throw new Unauthorized401Error('Invalid credentials')
  }


  const token = jwt.sign( { email: email, id: oldUser._id }, secret, { expiresIn: '24h' } )

  if (oldUser.password) delete oldUser.password
  return { ...oldUser, 'token' : token }
}

const loginWithGoogle = async (data) => {
  const { email, name, cover } = data


  const oldUser = await UserModel.getOneByEmail(email)

  if (!oldUser) {
    const password = makeId(6)

    SENDMAIL(setOptions('Create account', password, 'This is new password. You can login by email and this password later.', email), () => {
      console.log('Email sent successfully')
    })

    const hashPassword = await bcrypt.hash(password, 12)

    const insertData = {
      name: name,
      email: email,
      password: hashPassword,
      cover: cover,
      active: true
    }

    await UserModel.createNew(insertData)


    const newUser = await UserModel.getOneByEmail(email)

    const userId = newUser._id.toString()

    // Create ownership
    const ownershipData = {
      userId: userId
    }

    const createdOwnership = await OwnershipService.createNew(ownershipData)

    const workplaceData = {
      userId: userId,
      title: 'My workplace'
    }

    await WorkplaceService.createNew(workplaceData)

    const token = jwt.sign( { email: email, id: userId }, secret, { expiresIn: '24h' } )


    if (newUser.password) delete newUser.password
    return { ...newUser, 'token' : token }
  }

  const token = jwt.sign( { email: email, id: oldUser._id }, secret, { expiresIn: '24h' } )

  if (oldUser.password) delete oldUser.password
  return { ...oldUser, 'token' : token }
}

const signup = async (data) => {

  const { name, email, password } = data

  const oldUser = await UserModel.getOneByEmail(email)

  if (oldUser) {
    throw new Conflict409Error('User already exists')
  }

  data.password = await bcrypt.hash(password, 12)
  const active_code = makeId(6)

  // console.log('active_code', active_code)

  SENDMAIL(setOptions('Active account', active_code, 'This is verify code. Please verify your account.', email), () => {
    console.log('Email sent successfully')
  })

  data.active_code = await bcrypt.hash(active_code, 12)

  const token = jwt.sign( { name: name, email: email, password: password, active_code: data.active_code }, secret, { expiresIn: '1h' } )

  return { 'token' : token }

}

const activate = async (data) => {
  const { token, role, organizationName } = data
  let decodedData

  if (token) {
    decodedData = jwt.verify(token, secret)

    const { name, email, password, active_code } = decodedData

    const isActiveCodeCorrect = await bcrypt.compare(data.active_code, active_code)

    if (!isActiveCodeCorrect) {
      throw new Unauthorized401Error('Invalid credentials')
    }

    const hashPassword = await bcrypt.hash(password, 12)

    const insertData = {
      name: name,
      email: email,
      password: hashPassword,
      active: true,
      role: role,
      organizationName: organizationName
    }

    const oldUser = await UserModel.getOneByEmail(email)

    if (oldUser) {
      throw new Conflict409Error('User already exists')
    }

    await UserModel.createNew(insertData)

    const return_token = jwt.sign( { email: email, password: password }, secret, { expiresIn: '24h' } )

    const newUser = await UserModel.getOneByEmail(email)

    const userId = newUser._id.toString()

    // Create ownership
    const ownershipData = {
      userId: userId
    }

    const createdOwnership = await OwnershipService.createNew(ownershipData)

    // Create workplace
    const workplaceData = {
      userId: userId,
      title: 'My workplace'
    }

    const newWorkplace = await WorkplaceService.createNew(workplaceData)

    return { 'token' : return_token }
  }
}

export const UserService = {
  login,
  signup,
  activate,
  loginWithGoogle
}