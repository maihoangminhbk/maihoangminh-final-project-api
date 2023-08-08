import onCardDropHandler from './onCardDropHandler'
import onColumnAddHandler from './onColumnAddHandler'
import onColumnDropHandler from './onColumnDropHandler'
import onColumnUpdateStateHandler from './onColumnUpdateStateHandler'
import onJoinBoardHandler from './onJoinBoard'

const boardConnection = (socket) => {

  onColumnDropHandler(socket)

  onColumnAddHandler(socket)

  onColumnUpdateStateHandler(socket)

  onCardDropHandler(socket)

  onJoinBoardHandler(socket)

  socket.on('disconnect', (reason) => {
    // console.log('reason', reason)
  })

}

export default boardConnection