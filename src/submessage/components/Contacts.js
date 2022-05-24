import React, { useState, useEffect } from "react"
import { useSubstrateState } from '../../substrate-lib'
import { List } from 'semantic-ui-react'
import Avatar from 'react-avatar';

const Contacts = ({ sender, recipient, setRecipient }) => {
  const round = "5px"
  const size = "30"
  const style = { marginRight: '.5rem' }

  const { api, keyring } = useSubstrateState()
  const [contacts, setContacts] = useState([]);

  const onClickListItem = (address) => {
    console.log('selected address', address)
    if (recipient !== address) {
      setRecipient(address)
    }
  }

  useEffect(() => {
    if (!sender) return;

    let unsubscribe

    api.query.messaging.accountIdsByAccountId(sender, (maybeAccountIds) => {
      const accountIds = maybeAccountIds.unwrapOrDefault([]).toArray().map(n => n.toString());
      console.log('recent conversations with', accountIds);
      if (accountIds.length) {
        setContacts(keyring.getPairs()
          .filter(account => accountIds.find(accountId => accountId === account.address))
          .map(account => ({
            address: account.address,
            name: account.meta.name.toUpperCase(),
          })))
      }
    }).then(unsub => {
      unsubscribe = unsub
    })
    .catch(console.error)

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [sender]);

  return (
    <List selection verticalAlign='middle' style={{ overflowY: "auto", height: "440px" }}>
      {
        contacts.map(account => (
          <List.Item key={account.address} onClick={() => onClickListItem(account.address)}>
            <List.Content>
              <List.Header>
                <Avatar name={account.name} round={round} size={size} style={style} />
                {account.name}
              </List.Header>
            </List.Content>
          </List.Item>
        ))
      }
    </List>
  )
}

export default Contacts