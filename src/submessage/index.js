import React, { useState } from "react"
import { useSubstrateState } from '../substrate-lib'
import { u8aToHex } from '@polkadot/util';
import { Grid } from 'semantic-ui-react'
import { NewMessage, Contacts, Chat } from './components'

const SubMessage = () => {
  const { api, currentAccount } = useSubstrateState()
  const { address: sender } = currentAccount || {}
  const [recipient, setRecipient] = useState()
  const [channelId, setChannelId] = useState()
  const [commonKey, setCommonKey] = useState()
  const [currentMessages, setCurrentMessages] = useState([]);


  const handleReloadMessages = async () => {
    console.log('sender', sender)
    console.log('recipient', recipient)
    if (!sender || !recipient) {
      return;
    }

    const result = await api.query.messaging.channelIdByAccountIds(sender, recipient);
    const channelId = result.unwrapOr(null);
    console.log('channelId', channelId)
    if (!channelId) {
      setChannelId(null);
      setCurrentMessages([]);
      return;
    }

    const commonKeyResult = await api.query.messaging.commonKeyByAccountIdChannelId(sender, channelId);
    const commonKey = commonKeyResult.unwrap();

    console.log('CommonKey=', u8aToHex(commonKey));
    setChannelId(channelId);
    setCommonKey(commonKey);

    return api.query.messaging.messageIdsByChannelId(channelId, async (optionMessageIds) => {
      const messageIds = optionMessageIds.unwrapOrDefault([]).toArray();
      const messages = await api.query.messaging.messageByMessageId.multi(messageIds);
      setCurrentMessages(messages.map(m => m.unwrap()));
    });
  }

  return (<Grid celled>
    <Grid.Row>
      <Grid.Column width={5}>
        <Grid.Row>
          <Grid.Column>
            <NewMessage handleReloadMessages={handleReloadMessages}
              sender={sender}
              recipient={recipient}
              setRecipient={setRecipient} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Contacts handleReloadMessages={handleReloadMessages}
              sender={sender}
              recipient={recipient}
              setRecipient={setRecipient} />
          </Grid.Column>
        </Grid.Row>
      </Grid.Column>
      <Grid.Column width={11}>
        <Chat handleReloadMessages={handleReloadMessages}
              messages={currentMessages} 
              sender={sender} 
              recipient={recipient} 
              commonKey={commonKey}
              channelId={channelId} />
      </Grid.Column>
    </Grid.Row>
  </Grid>)
}


export default SubMessage