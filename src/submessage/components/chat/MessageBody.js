import { Container, Message, Grid } from 'semantic-ui-react'
import Avatar from 'react-avatar'
import { u8aToString } from '@polkadot/util';
import { naclDecrypt } from '@polkadot/util-crypto';


const MessageBody = ({ messages, sender, recipientName, commonKey }) => {
  const messageStyle = {
    marginTop: '.3rem',
    marginBottom: '.3rem',
    padding: '.5rem'
  }

  return (
    <Container style={{ overflowY: "auto", height: "400px" }}>
      { messages.map(message => {
        const isSender = message.sender.toString() === sender;
        const text = u8aToString(naclDecrypt(message.content.asEncrypted, message.nonce, commonKey))
        if (isSender) {
          return (
            <Container textAlign="right" key={message.id}>
              <Message compact color="black" style={messageStyle}>{text}</Message>
            </Container>
          )
        } else {
          return (
            <Grid key={message.id}>
              <Grid.Row>
                <Grid.Column width={1}>
                  <Avatar name={recipientName} round="20px" size="40" />
                </Grid.Column>
                <Grid.Column width={15}>
                  <Message compact color="teal" style={messageStyle}>{text}</Message>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )
        }
      })}
    </Container>
  )
}

export default MessageBody
