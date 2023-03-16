const onColumnDropListener = 'onColumnDrop'
const onColumnDropEmit = 'onColumnDrop'

const onColumnDropHandler = (socket) => {

  const handleOnColumnDrop = (boardId, dropResult) => {
    socket.to(boardId).emit(onColumnDropEmit, dropResult)
  }

  socket.on(onColumnDropListener, handleOnColumnDrop)
}

export default onColumnDropHandler