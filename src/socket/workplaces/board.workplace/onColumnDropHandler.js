const onColumnDropListener = 'onColumnDrop'
const onColumnDropEmit = 'onColumnDrop'

const onColumnDropHandler = (socket) => {

  const handleOnColumnDrop = (dropResult) => {
    console.log(dropResult)
    socket.broadcast.emit(onColumnDropEmit, dropResult)
  }

  socket.on(onColumnDropListener, handleOnColumnDrop)
}

export default onColumnDropHandler