import { List } from 'semantic-ui-react'
import Avatar from 'react-avatar';

const round = "5px"
const size = "30"
const Contacts = () => (
  <List selection verticalAlign='middle'>
    <List.Item>
      <List.Content>
        <List.Header><Avatar name="Helen" round={ round } size={ size } /> Helen</List.Header>
      </List.Content>
    </List.Item>
    <List.Item>
        <List.Content>
        <List.Header><Avatar name="Christian" round={ round } size={ size } /> Christian</List.Header>
      </List.Content>
    </List.Item>
    <List.Item>
      <List.Content>
        <List.Header><Avatar name="Daniel" round={ round } size={ size } /> Daniel</List.Header>
      </List.Content>
    </List.Item>
  </List>
)

export default Contacts
