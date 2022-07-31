import { UserModel } from '*/models/user.model'
import { cloneDeep } from 'lodash'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { OwnershipService } from '*/services/ownership.service'
import { WorkplaceService } from '*/services/workplace.service'

import { env } from '*/config/environment'
const secret = process.env.JWT_SECRET

const login = async (data) => {
  const { email, password } = data

  try {
    const oldUser = await UserModel.getOneByEmail(email)

    if (!oldUser) {
      throw new Error('User doesn\'t exist')
    }

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password)

    if (!isPasswordCorrect) {
      throw new Error('Invalid credentials')
    }


    const token = jwt.sign( { email: email, id: oldUser._id }, secret, { expiresIn: '1h' } )

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
    console.log('user service - login - test')
    const result = await UserModel.createNew(data)
    console.log('user service - login - test 2')
    console.log('user service - login - secret', secret)

    const token = jwt.sign( { email: email, password: password }, secret, { expiresIn: '1h' } )

    const newUserEmail = data.email

    const newUser = await UserModel.getOneByEmail(newUserEmail)

    const userId = newUser._id.toString()
    console.log('user service - sign up - newUser', userId)
    const ownershipData = {
      userId: userId
    }

    const createdOwnership = await OwnershipService.createNew(ownershipData)

    const workplaceData = {
      userId: userId,
      title: 'My workplace'
    }

    const createdWorkplace = await WorkplaceService.createNew(workplaceData)


    const updatedOwnership = await OwnershipService.pushWorkplaceOrder(userId, createdWorkplace._id.toString())

    console.log('user service - sign up - updatedOwnership', updatedOwnership)
    // newBoard.columns = []

    return { ...newUser, 'token' : token }
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
  signup
  // getFullBoard,
  // update
}