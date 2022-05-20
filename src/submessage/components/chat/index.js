import React, { useState } from "react"
import { Container, Divider } from 'semantic-ui-react'
import MessageHeader from './MessageHeader'
import MessageBody from './MessageBody'
import MessageFooter from './MessageFooter'

// REF: https://ordinarycoders.com/blog/article/react-chakra-ui
const Chat = () => {
  const [messages, setMessages] = useState([
    { from: "computer", text: "Hi, My Name is HoneyChat" },
    { from: "me", text: "Hey there" },
    { from: "me", text: "Myself Ferin Patel" },
    {
      from: "computer",
      text: "Nice to meet you. You can send me message and i'll reply you with same message.",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")

  const handleSendMessage = () => {
    if (!inputMessage.trim().length) {
      return
    }
    const data = inputMessage

    setMessages((old) => [...old, { from: "me", text: data }])
    setInputMessage("")

    setTimeout(() => {
      setMessages((old) => [...old, { from: "computer", text: data }])
    }, 1000)
  }

  return (
    <Container>
      <MessageHeader />
      <Divider />
      <MessageBody messages={messages} />
      <Divider />
      <MessageFooter
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage} />
    </Container>
  )
}

export default Chat
