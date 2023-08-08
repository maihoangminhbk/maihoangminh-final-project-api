const onJoinBoardListener = 'onJoinBoard'
const onJoinBoardEmit = 'onJoinBoard'

const onJoinBoardHandler = (socket) => {

  const handleOnJoinBoard = (boardId) => {
    // console.log('On join board', boardId)

    // socket.leaveAll()
    const roomArr = [...socket.rooms]

    if (roomArr[1]) {
      socket.leave(roomArr[1])
    }

    socket.join(boardId)
  }

  socket.on(onJoinBoardListener, handleOnJoinBoard)
}

export default onJoinBoardHandler