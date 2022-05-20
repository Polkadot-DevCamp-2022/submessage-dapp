import { List } from 'semantic-ui-react'
import Avatar from 'react-avatar';

const Contacts = () => {
  const round = "5px"
  const size = "30"
  const style = { marginRight: '.5rem' }
  
  return (
    <List selection verticalAlign='middle'>
      <List.Item>
        <List.Content>
          <List.Header><Avatar name="Helen" round={round} size={size} style={style} />Helen</List.Header>
        </List.Content>
      </List.Item>
      <List.Item>
        <List.Content>
          <List.Header><Avatar name="Christian" round={round} size={size} style={style} />Christian</List.Header>
        </List.Content>
      </List.Item>
      <List.Item>
        <List.Content>
          <List.Header><Avatar name="Daniel" round={round} size={size} style={style} />Daniel</List.Header>
        </List.Content>
      </List.Item>
      <List.Item>
        <List.Content>
          <List.Header><Avatar name="John Dow" round={round} size={size} style={style} />John Dow</List.Header>
        </List.Content>
      </List.Item>
    </List>
  )
}

export default Contacts