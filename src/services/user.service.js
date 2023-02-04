import { UserModel } from '*/models/user.model'
import { cloneDeep } from 'lodash'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { OwnershipService } from '*/services/ownership.service'
import { WorkplaceService } from '*/services/workplace.service'

import { makeId } from '*/ultilities/randomId'

import SENDMAIL, { setOptions } from '*/mailer/mailer.js'

import { env } from '*/config/environment'
const secret = process.env.JWT_SECRET

const login = async (data) => {
  const { email, password } = data

  try {
    const oldUser = await UserModel.getOneByEmail(email)

    if (!oldUser) {
      throw new Error('User doesn\'t exist')
    }

    if (!oldUser.active) {
      throw new Error('Account not activate')
    }

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password)

    if (!isPasswordCorrect) {
      throw new Error('Invalid credentials')
    }


    const token = jwt.sign( { email: email, id: oldUser._id }, secret, { expiresIn: '24h' } )

    return { ...oldUser, 'token' : token }
  } catch (error) {
    throw new Error(error)
  }
}

const signup = async (data) => {

  const { name, email, password } = data
  try {
    const oldUser = await UserModel.getOneByEmail(email)

    if (oldUser) {
      throw new Error('User already exists')
    }

    data.password = await bcrypt.hash(password, 12)
    const active_code = makeId(6)
    console.log('user service - sign up - active code', active_code)


    console.log('user service - login - email', email)

    SENDMAIL(setOptions('Active account', active_code, email), (info) => {
      console.log('Email sent successfully')
      console.log('MESSAGE ID: ', info.messageId)
    })

    data.active_code = await bcrypt.hash(active_code, 12)
    console.log('user service - signup - data.active_code', data.active_code)

    // const result = await UserModel.createNew(data)
    console.log('user service - login - test 2')
    console.log('user service - login - secret', secret)

    const token = jwt.sign( { name: name, email: email, password: password, active_code: data.active_code }, secret, { expiresIn: '1h' } )

    // const newUserEmail = data.email

    // const newUser = await UserModel.getOneByEmail(newUserEmail)

    // const userId = newUser._id.toString()
    // console.log('user service - sign up - newUser', userId)

    // const workplaceData = {
    //   userId: userId,
    //   title: 'My workplace'
    // }

    // const createdWorkplace = await WorkplaceService.createNew(workplaceData)

    return { 'token' : token }
  } catch (error) {
    throw new Error(error)
  }
}

const activate = async (data) => {
  try {
    const token = data.token
    let decodedData
    console.log('user service - activate - token', token)

    console.log('user service - activate - secret', secret)
    console.log('user service - activate - token', token)
    if (token) {
      decodedData = jwt.verify(token, secret)

      console.log('user service - activate - decodedData', decodedData)

      const { name, email, password, active_code } = decodedData
      // const password = decodedData?.password
      // const active_code = decodedData?.active_code

      const isActiveCodeCorrect = await bcrypt.compare(data.active_code, active_code)

      console.log('user service - activate - isActiveCodeCorrect', isActiveCodeCorrect)
      if (!isActiveCodeCorrect) {
        throw new Error('Invalid credentials')
      }

      const hashPassword = await bcrypt.hash(password, 12)

      const insertData = {
        name: name,
        email: email,
        password: hashPassword,
        active: true
      }

      const oldUser = await UserModel.getOneByEmail(email)

      if (oldUser) {
        throw new Error('User already exists')
      }

      const result = await UserModel.createNew(insertData)

      console.log('user service - login - test 2')
      console.log('user service - login - secret', secret)

      const return_token = jwt.sign( { email: email, password: password }, secret, { expiresIn: '24h' } )

      // const newUserEmail = data.email

      const newUser = await UserModel.getOneByEmail(email)

      const userId = newUser._id.toString()
      console.log('user service - activate - newUser', userId)

      const workplaceData = {
        userId: userId,
        title: 'My workplace'
      }

      const createdWorkplace = await WorkplaceService.createNew(workplaceData)

      return { 'token' : return_token }
    }
  } catch (error) {
    throw new Error(error)
  }


}

// const getFullBoard = async (boardId) => {
//   try {
//     const board = await BoardModel.getFullBoard(boardId)

//     if (!board || !board.columns) {
//       throw new Error('Board not found!')
//     }

//     const transformBoard = cloneDeep(board)
//     // Filter deleted columns
//     transformBoard.columns = transformBoard.columns.filter(column => !column._destroy)

//     // Add card to each column
//     transformBoard.columns.forEach(column => {
//       column.cards = transformBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
//     })

//     // Remove cards from board
//     delete transformBoard.cards

//     // Sort column by column order, sort card by card order: This step will pass to front-end


//     return transformBoard
//   } catch (error) {
//     throw new Error(error)
//   }
// }

// const update = async (id, data) => {
//   try {
//     const updateData = {
//       ...data,
//       updatedAt: Date.now()
//     }

//     if (updateData._id) delete updateData._id
//     if (updateData.columns) delete updateData.columns

//     const updatedBoard = await BoardModel.update(id, updateData)

//     return updatedBoard
//   } catch (error) {
//     throw new Error(error)
//   }
// }

export const UserService = {
  login,
  signup,
  activate
  // getFullBoard,
  // update
}