import { OwnershipService } from '*/services/ownership.service'
import { ColumnService } from '*/services/column.service'
import { CardService } from '*/services/card.service'
import { TaskService } from '*/services/task.service'

import { Unauthorized401Error } from '*/ultilities/errorsHandle/APIErrors'
import { ROLE } from '*/ultilities/constants'


const authorization = function(role) {
  return async (req, res, next) => {
    try {
      switch (role) {
      case ROLE.WORKPLACE_ADMIN:
      {
        let { id, userId } = req.params
        if (req.body.workplaceId) {
          id = req.body.workplaceId
        }
        const ownership = await OwnershipService.checkWorkplaceAdmin(id, userId)

        if (!ownership) {
          throw new Unauthorized401Error('Only workplace admin can perform this action')
        }
        break
      }

      case ROLE.BOARD_ADMIN:
      {
        const { id, userId } = req.params

        let boardId = id

        if (req.baseUrl.toString().includes('columns')) {
          boardId = await ColumnService.getBoardId(id)

          if (!boardId) {
            boardId = req.body.boardId
          }
        }

        if (req.baseUrl.toString().includes('cards')) {
          boardId = await CardService.getBoardId(id)

          if (!boardId) {
            boardId = req.body.boardId
          }
        }

        const ownership = await OwnershipService.checkBoardAdmin(boardId, userId)

        if (!ownership) {
          throw new Unauthorized401Error('Only board admin can perform this action')
        }
        break
      }

      case ROLE.BOARD_USER: {
        const { id, userId } = req.params

        let boardId = id

        if (req.baseUrl.toString().includes('columns')) {
          boardId = await ColumnService.getBoardId(id)

          if (!boardId) {
            boardId = req.body.boardId
          }
        }

        if (req.baseUrl.toString().includes('cards')) {
          boardId = await CardService.getBoardId(id)

          if (!boardId) {
            boardId = req.body.boardId
          }
        }

        const ownership = await OwnershipService.checkBoardUser(boardId, userId)

        if (!ownership) {
          throw new Unauthorized401Error('Only board user can perform this action')
        }
        break
      }

      case ROLE.CARD_USER: {
        const { id, userId } = req.params

        let cardId = id

        if (req.baseUrl.toString().includes('tasks')) {
          cardId = await TaskService.getCardId(id)
          console.log('check')

          if (!cardId) {
            console.log('check1')
            cardId = req.body.cardId
          }
        }

        console.log('cardId', cardId)

        const ownership = await OwnershipService.checkCardUser(cardId, userId)

        if (!ownership) {
          throw new Unauthorized401Error('Only card user can perform this action')
        }
        break
      }

      case ROLE.TASK_USER: {
        const { id, userId } = req.params

        let cardId = id

        if (req.baseUrl.toString().includes('tasks')) {
          cardId = await TaskService.getCardId(id)
          console.log('check')

          if (!cardId) {
            console.log('check1')
            cardId = req.body.cardId
          }
        }

        console.log('cardId', cardId)

        const ownership = await OwnershipService.checkCardUser(cardId, userId)

        if (!ownership) {
          throw new Unauthorized401Error('Only card user can perform this action')
        }
        break
      }

      default: {
        throw new Unauthorized401Error('You don\'t have enough permission to perform this action')
      }

      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
export default authorization