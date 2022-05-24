import { Item, Container } from 'semantic-ui-react'
import Avatar from 'react-avatar';

const MessageHeader = ({ recipientAddress, recipientName }) => (
  <Container>
    <div style={{ width: "55px", float: "left" }}>
      <Avatar name={recipientName} round="30px" size="50" />
    </div>
    <div style={{ marginLeft: "55px" }}>
      <Item>
        <Item.Content>
          <Item.Description>{recipientName}</Item.Description>
          <Item.Meta style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>{recipientAddress}</Item.Meta>
        </Item.Content>
      </Item>
    </div>
    <div style={{ clear: "both" }} />
  </Container>
)

export default MessageHeader
