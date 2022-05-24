import { useSubstrateState } from '../../substrate-lib'
import { List } from 'semantic-ui-react'
import Avatar from 'react-avatar';

const Contacts = ({ sender, recipient, setRecipient }) => {
  const round = "5px"
  const size = "30"
  const style = { marginRight: '.5rem' }

  const { keyring } = useSubstrateState()

  const onClickListItem = (address) => {
    console.log('address', address)
    if (recipient !== address) {
      setRecipient(address)
    }
  }

  keyring.getPairs()
    .filter(account => account.address !== sender)
    .map(account => ({
      address: account.address,
      name: account.meta.name.toUpperCase(),
    }))

  return (
    <List selection verticalAlign='middle' style={{ overflowY: "auto", height: "440px" }}>
      {keyring.getPairs()
        .filter(account => account.address !== sender)
        .map(account => (
          <List.Item key={account.address} onClick={()=>onClickListItem(account.address)}>
            <List.Content>
              <List.Header>
                <Avatar name={account.meta.name.toUpperCase()} round={round} size={size} style={style} />
                {account.meta.name.toUpperCase()}
              </List.Header>
            </List.Content>
          </List.Item>
        ))
      }
    </List>
  )
}

export default Contacts