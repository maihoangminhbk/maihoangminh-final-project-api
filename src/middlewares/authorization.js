import { OwnershipService } from '*/services/ownership.service'
import { ColumnService } from '*/services/column.service'
import { CardService } from '*/services/card.service'

import { Unauthorized401Error } from '*/ultilities/errorsHandle/APIErrors'
import { ROLE } from '*/ultilities/constants'


const authorization = function(role) {
  return async (req, res, next) => {
    try {
      switch (role) {
      case ROLE.WORKPLACE_ADMIN:
      {
        const { id, userId } = req.params
        const ownership = await OwnershipService.checkWorkplaceAdmin(id, userId)
        console.log('authorization - ownership check workplace admin', ownership)

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
        console.log('authorization - ownership check board admin', ownership)

        if (!ownership) {
          throw new Unauthorized401Error('Only board admin can perform this action')
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