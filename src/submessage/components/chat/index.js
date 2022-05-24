import React, { useState, useEffect } from "react"
import { useSubstrateState } from '../../../substrate-lib'
import { Container, Divider, Segment, Header, Icon } from 'semantic-ui-react'
import MessageHeader from './MessageHeader'
import MessageBody from './MessageBody'
import MessageSender from '../MessageSender'

// REF: https://ordinarycoders.com/blog/article/react-chakra-ui
const Chat = ({ handleReloadMessages, messages, sender, recipient, commonKey, channelId }) => {

  console.log('messages', messages)

  useEffect(() => {
    let unsub,
        mounted = true;

    (async () => {
        unsub = await handleReloadMessages();
        return unsub;
    })().then(unsub => {
        if (!mounted) {
            unsub && unsub();
        }
    });

    return () => {
        mounted = false;
        unsub && unsub();
    };
  }, [sender, recipient]);

  if (!messages.length) {
    return (
      <Segment placeholder style={{height: "100%"}}>
        <Header icon>
          <Icon name="conversation">SubMessage</Icon>
          Your Private and Secure Messenger
        </Header>
      </Segment>
    )
  } else {
    const { keyring } = useSubstrateState()
    const keyringOptions = keyring.getPairs()
        .filter(account => account.address === recipient)
        .map(account => ({
            name: account.meta.name.toUpperCase()
         }))

    console.log('keyringOptions', keyringOptions)

    return (
      <Container>
        <MessageHeader recipientAddress={recipient} 
                       recipientName={keyringOptions[0].name} />
        <Divider />
        <MessageBody messages={messages}
                     sender={sender} 
                     recipientName={keyringOptions[0].name} 
                     commonKey={commonKey} 
                     />
        <Divider />
        <MessageSender handleReloadMessages={handleReloadMessages} 
                       recipient={recipient} 
                       commonKey={commonKey} 
                       channelId={channelId} />
      </Container>
    )
  }
}

export default Chat
