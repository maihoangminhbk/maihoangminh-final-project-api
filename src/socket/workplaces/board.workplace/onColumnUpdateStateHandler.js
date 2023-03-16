const onColumnUpdateStateListener = 'onColumnUpdateState'
const onColumnUpdateStateEmit = 'onColumnUpdateState'

const onColumnUpdateStateHandler = (socket) => {

  const handleOnColumnUpdateState = (boardId, newColumnToUpdate) => {
    socket.to(boardId).emit(onColumnUpdateStateEmit, newColumnToUpdate)
  }

  socket.on(onColumnUpdateStateListener, handleOnColumnUpdateState)
}

export default onColumnUpdateStateHandler