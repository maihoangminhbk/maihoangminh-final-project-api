const onCardDropListener = 'onCardDrop'
const onCardDropEmit = 'onCardDrop'

const onCardDropHandler = (socket) => {

  const handleOnCardDrop = (columnId, dropResult) => {
    console.log(columnId, dropResult)
    socket.broadcast.emit(onCardDropEmit, columnId, dropResult)
  }

  socket.on(onCardDropListener, handleOnCardDrop)
}

export default onCardDropHandler