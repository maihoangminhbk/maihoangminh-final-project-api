import onChatbotHandler from './onChatbotHandler'

const chatbotConnection = (socket) => {
  // console.log('a user connected to chatbot socket server', socket.id)

  onChatbotHandler(socket)

  socket.on('disconnect', (reason) => {
    // console.log('reason', reason)
  })

}

export default chatbotConnection