import { io } from '*/socket/socketServer'

const onColumnAddListener = 'onColumnAdd'
const onColumnAddEmit = 'onColumnAdd'

const onColumnAddHandler = (socket) => {

  const handleOnColumnAdd = (boardId, column) => {
    socket.to(boardId).emit(onColumnAddEmit, column)
  }

  socket.on(onColumnAddListener, handleOnColumnAdd)
}

export default onColumnAddHandler