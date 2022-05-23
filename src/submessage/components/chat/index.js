import React, { useState } from "react"
import { Container, Divider, Segment, Header, Icon } from 'semantic-ui-react'
import MessageHeader from './MessageHeader'
import MessageBody from './MessageBody'
import MessageFooter from './MessageFooter'

// REF: https://ordinarycoders.com/blog/article/react-chakra-ui
const Chat = () => {
  const [messages, setMessages] = useState([
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

  if (!messages.length) {
    return (
      <Segment placeholder>
        <Header icon>
          <Icon name="conversation">SubMessage</Icon>
          Your Private and Secure Messenger
        </Header>
      </Segment>
    )
  } else {
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
}

export default Chat
