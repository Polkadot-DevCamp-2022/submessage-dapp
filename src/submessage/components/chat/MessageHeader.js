import { Item } from 'semantic-ui-react'
import Avatar from 'react-avatar';

const MessageHeader = () => (
  <Item>
    <Item.Content verticalAlign='middle'>
      <Avatar name="John Dow" round="30px" size="60" style={{ marginRight: '.5rem' }} />
      John Dow
    </Item.Content>
  </Item>
)

export default MessageHeader
