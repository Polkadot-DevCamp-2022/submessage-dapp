import React, { useState } from "react"
import { useSubstrateState } from '../substrate-lib'
import { Divider, Grid } from 'semantic-ui-react'
import { NewMessage, Contacts, Chat } from './components'
import { web3FromSource } from "@polkadot/extension-dapp";
import { u8aToHex, hexToU8a } from '@polkadot/util';

const SubMessage = () => {
  const { api, currentAccount } = useSubstrateState()
  const { address: sender } = currentAccount || {}
  const [recipient, setRecipient] = useState()
  const [channelId, setChannelId] = useState()
  const [commonKey, setCommonKey] = useState()
  const [encryptedCommonKey, setEncryptedCommonKey] = useState()
  const [currentMessages, setCurrentMessages] = useState([]);

  const handleReloadMessages = async () => {
    if (!sender || !recipient) {
      return;
    }

    const result = await api.query.messaging.channelIdByAccountIds(sender, recipient);
    const channelId = result.unwrapOr(null);

    if (!channelId) {
      setChannelId(null);
      setCurrentMessages([]);
      return;
    } 
    
    const commonKeyResult = await api.query.messaging.commonKeyByAccountIdChannelId(sender, channelId);
    const commonKey = commonKeyResult.unwrap();
    const hexCommonKey = u8aToHex(commonKey)
    if (hexCommonKey !== encryptedCommonKey) {
      setEncryptedCommonKey(u8aToHex(commonKey))
      setCommonKey(await decryptCommonKey(hexCommonKey))
    }

    setChannelId(channelId)

    return api.query.messaging.messageIdsByChannelId(channelId, async (optionMessageIds) => {
      const messageIds = optionMessageIds.unwrapOrDefault([]).toArray();
      const messages = await api.query.messaging.messageByMessageId.multi(messageIds);
      setCurrentMessages(messages.map(m => m.unwrap()));
    });
  }


  const decryptCommonKey = async (hexCommonKey) => {
    const [address, {decrypter}] = await getFromAcct()
    const decryptResult = await decrypter.decrypt({ address: address, encrypted: hexCommonKey })
    const { decrypted } = decryptResult
    const decryptedCommonKey = hexToU8a(decrypted)
    // console.log('decryptedCommonKey', decryptedCommonKey)
    return decryptedCommonKey;
  }
  

  const getFromAcct = async () => {
    const {
        address,
        meta: { source, isInjected },
    } = currentAccount

    if (!isInjected) {
        return [currentAccount]
    }

    // currentAccount is injected from polkadot-JS extension, need to return the addr and signer object.
    // ref: https://polkadot.js.org/docs/extension/cookbook#sign-and-send-a-transaction
    const injector = await web3FromSource(source)
    console.log("injector.decrypter", injector.decrypter)
    return [address, { signer: injector.signer, decrypter: injector.decrypter }]
  }

  return (<Grid celled>
    <Grid.Row>
      <Grid.Column width={5}>
        <Grid.Row>
          <Grid.Column>
            <NewMessage handleReloadMessages={handleReloadMessages}
              sender={sender}
              recipient={recipient}
              setRecipient={setRecipient} 
              commonKey={commonKey}
              channelId={channelId} 
              getFromAcct={getFromAcct} />
          </Grid.Column>
        </Grid.Row>
        <Divider />
        <Grid.Row>
          <Grid.Column>
            <Contacts sender={sender}
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
              channelId={channelId} 
              getFromAcct={getFromAcct} />
      </Grid.Column>
    </Grid.Row>
  </Grid>)
}


export default SubMessage