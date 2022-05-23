import React, {useEffect, useState} from 'react'
import {Dropdown, Grid, Input} from 'semantic-ui-react'

import {useSubstrateState} from './substrate-lib'
import {u8aToString} from '@polkadot/util';
import {web3FromSource} from "@polkadot/extension-dapp";

function Main(props) {
    const { api, keyring, currentAccount } = useSubstrateState();
    const [recipient, setRecipient] = useState();
    const [currentMessages, setCurrentMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [onSubmitting, setOnSubmitting] = useState(false);

    const { address: sender } = currentAccount || {};

    const keyringOptions = keyring.getPairs()
        .filter(account => account.address !== sender)
        .map(account => ({
            key: account.address,
            value: account.address,
            text: `${account.meta.name.toUpperCase()} - ${account.address}`,
        }));

    const onChangeRecipient = (_, data) => {
        setRecipient(data.value);
    }

    const onChangeNewMessage = (_, { value}) => {
        setNewMessage(value);
    }

    const reloadMessages = async () => {
        if (sender && recipient) {
            api.query.messaging.messageIdsByAccountIds(sender, recipient, (optionMessageIds) => {
                console.log(optionMessageIds);
                const messageIds = optionMessageIds.unwrapOrDefault([]).toArray();

                api.query.messaging.messageByMessageId.multi(messageIds, (messages) => {
                    setCurrentMessages(messages.map(m => m.unwrap()))
                })
            });
        }
    }

    useEffect(() => {
        (async () => {
            await reloadMessages();
        })();
    }, [recipient]);

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
        return [address, { signer: injector.signer }]
    }

    const submitNewMessage = async () => {
        setOnSubmitting(true);

        const fromAcct = await getFromAcct()
        const secret = randomAsU8a(32);
        const messagePreEncryption = stringToU8a(newMessage);
        const noncePreEncryption = randomAsU8a(24);
        const { encrypted } = naclEncrypt(messagePreEncryption, secret, noncePreEncryption);
        
        await api.tx.messaging
            .newMessage(recipient, encrypted)
            .signAndSend(...fromAcct, ({ status }) => {
                console.log(status);
                if (status.isFinalized) {
                    setNewMessage('');
                    setOnSubmitting(false);
                }
            });
    }

    const isDisabled = !recipient || onSubmitting;

    currentMessages.forEach(m => {
        console.log(m.sender.toString())
    })

    return (
        <Grid.Column width={8}>
            <h1>Messaging</h1>
            <Dropdown
                placeholder="Select a recipient"
                fluid
                selection
                search
                options={keyringOptions}
                value={recipient}
                state="recipient"
                onChange={onChangeRecipient}
            />

            <div style={{marginTop: 20, marginBottom: 20}}>
                {currentMessages.length === 0 && (<span>No messages</span>)}
                {currentMessages.length > 0 && (
                    currentMessages.map(m => (<p key={m.id} style={{ textAlign: m.sender.toString() === sender ? "right": "left"}}>{u8aToString(m.content.asRaw)}</p>))
                )}
            </div>

            <Input action={{content: 'Submit', onClick: submitNewMessage, disabled: isDisabled}}
                   fluid
                   placeholder='New message'
                   disabled={isDisabled}
                   input={{value: newMessage}}
                   onChange={onChangeNewMessage}
            />

        </Grid.Column>
    )
}

export default function Messaging(props) {
    const { api, keyring } = useSubstrateState()
    return keyring.getPairs && api.query.messaging ? (
        <Main {...props} />
    ) : null
}
