import { Item } from 'semantic-ui-react'
import Avatar from 'react-avatar';

const MessageHeader = ({recipientAddress, recipientName}) => (
  <Item>
    <Item.Content verticalAlign="middle">
      <Avatar name={recipientName} round="30px" size="60" style={{ marginRight: '.5rem' }} />
      {recipientName}
      <small style={{fontStyle: 'italic', fontSize: 11, marginLeft: ".5em" }}>{ recipientAddress }</small>
    </Item.Content>
  </Item>
)

export default MessageHeader
