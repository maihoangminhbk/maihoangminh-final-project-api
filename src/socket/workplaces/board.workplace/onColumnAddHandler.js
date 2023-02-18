const onColumnAddListener = 'onColumnAdd'
const onColumnAddEmit = 'onColumnAdd'

const onColumnAddHandler = (socket) => {

  const handleOnColumnAdd = (column) => {
    console.log(column)
    socket.broadcast.emit(onColumnAddEmit, column)
  }

  socket.on(onColumnAddListener, handleOnColumnAdd)
}

export default onColumnAddHandler