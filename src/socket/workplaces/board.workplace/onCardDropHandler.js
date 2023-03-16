const onCardDropListener = 'onCardDrop'
const onCardDropEmit = 'onCardDrop'

const onCardDropHandler = (socket) => {

  const handleOnCardDrop = (boardId, columnId, dropResult) => {
    socket.to(boardId).emit(onCardDropEmit, columnId, dropResult)
  }

  socket.on(onCardDropListener, handleOnCardDrop)
}

export default onCardDropHandler