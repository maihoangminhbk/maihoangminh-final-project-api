const onColumnUpdateStateListener = 'onColumnUpdateState'
const onColumnUpdateStateEmit = 'onColumnUpdateState'

const onColumnUpdateStateHandler = (socket) => {

  const handleOnColumnUpdateState = (newColumnToUpdate) => {
    console.log(newColumnToUpdate)
    socket.broadcast.emit(onColumnUpdateStateEmit, newColumnToUpdate)
  }

  socket.on(onColumnUpdateStateListener, handleOnColumnUpdateState)
}

export default onColumnUpdateStateHandler