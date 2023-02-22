const onChatbotListener = 'onChatbot'
const onChatbotEmit = 'onChatbot'

const onChatbotHandler = (socket) => {

  const handleOnChatbot = (data) => {
    console.log(data)

    const returnData = {
      
    }
    socket.broadcast.emit(onChatbotEmit, data)
  }

  socket.on(onChatbotListener, handleOnChatbot)
}

export default onChatbotHandler