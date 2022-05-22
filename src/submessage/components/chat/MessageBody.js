import { Container, Message, Grid } from 'semantic-ui-react'
import Avatar from 'react-avatar'

const MessageBody = ({ messages }) => {
  const messageStyle = {
    marginTop: '.3rem',
    marginBottom: '.3rem',
    padding: '.5rem'
  }

  return (
    <Container>
      {messages.map((item, index) => {
        if (item.from === "me") {
          return (
            <Container textAlign="right">
              <Message id={index} compact color="black" style={messageStyle}>{item.text}</Message>
            </Container>
          )
        } else {
          return (
            <Grid>
              <Grid.Row>
                <Grid.Column width={1}>
                  <Avatar name="John Dow" round="20px" size="40" />
                </Grid.Column>
                <Grid.Column width={15}>
                  <Message compact color="teal" style={messageStyle}>{item.text}</Message>
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
