import React, { useEffect, useRef } from 'react'
import { Container, Message } from 'semantic-ui-react'
import Avatar from 'react-avatar'
import { u8aToString } from '@polkadot/util';
import { naclDecrypt } from '@polkadot/util-crypto';

const MessageBody = ({ messages, sender, recipientName, commonKey }) => {
  const messageStyle = {
    padding: '.5rem'
  }

  const messageContainerStyle = {
    marginTop: '1rem',
    marginBottom: '1rem',
  }

  const messageContainerRef = useRef();

  // REF: javascript by Inquisitive Iguana 
  // https://www.codegrepper.com/code-examples/javascript/react+scroll+to+bottom
  const scrollToBottom = () => {
    messageContainerRef.current?.scrollTo({
      top: messageContainerRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }

  useEffect(scrollToBottom, [messages])


  return (
    <div style={{ overflowY: "auto", height: "400px" }} ref={messageContainerRef}>
      {messages.map(message => {
        const isSender = message.sender.toString() === sender;
        const text = u8aToString(naclDecrypt(message.content.asEncrypted, message.nonce, commonKey))
        if (isSender) {
          return (
            <Container textAlign="right" key={message.id} style={messageContainerStyle}>
              <Message compact color="black" style={messageStyle}>{text}</Message>
            </Container>
          )
        } else {
          return (
            <Container key={message.id} style={messageContainerStyle}>
              <div style={{ width: "45px", float: "left" }}>
                <Avatar name={recipientName} round="20px" size="40" />
              </div>
              <div style={{ marginLeft: "45px" }}>
                <Message compact color="teal" style={messageStyle}>{text}</Message>
              </div>
            </Container>
          )
        }
      })}
    </div>
  )
}

export default MessageBody
