import React, {useEffect, useState, useRef} from 'react'
import {Dropdown, Grid, Input} from 'semantic-ui-react'

import {useSubstrateState} from './substrate-lib'
import {u8aToString, stringToU8a, u8aToHex} from '@polkadot/util';
import {web3FromSource} from "@polkadot/extension-dapp";
import moment from 'moment';

import {
    naclDecrypt,
    naclEncrypt,
    randomAsU8a
} from '@polkadot/util-crypto';

function Main(props) {
    const {api, keyring, currentAccount} = useSubstrateState();
    const [currentMessages, setCurrentMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [onSubmitting, setOnSubmitting] = useState(false);

    const [recipient, setRecipient] = useState();
    const [channelId, setChannelId] = useState();
    const [commonKey, setCommonKey] = useState();

    const messageEndRef = useRef(null);

    const {address: sender} = currentAccount || {};

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

    const onChangeNewMessage = (_, {value}) => {
        setNewMessage(value);
    }

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView();
    }

    const reloadMessages = async () => {
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

        console.log('CommonKey=', u8aToHex(commonKey));
        setChannelId(channelId);
        setCommonKey(commonKey);

        return api.query.messaging.messageIdsByChannelId(channelId, async (optionMessageIds) => {
            const messageIds = optionMessageIds.unwrapOrDefault([]).toArray();
            const messages = await api.query.messaging.messageByMessageId.multi(messageIds);
            setCurrentMessages(messages.map(m => m.unwrap()));
        });
    }

    useEffect(() => {
        let unsub,
            mounted = true;

        (async () => {
            unsub = await reloadMessages();
            return unsub;
        })().then(unsub => {
            if (!mounted) {
                unsub && unsub();
            }
        });

        return () => {
            mounted = false;
            unsub && unsub();
        };
    }, [recipient]);

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessages([...currentMessages]);
        }, 60 * 1000);

        return () => clearInterval(interval);
    });

    const getFromAcct = async () => {
        const {
            address,
            meta: {source, isInjected},
        } = currentAccount

        if (!isInjected) {
            return [currentAccount]
        }

        // currentAccount is injected from polkadot-JS extension, need to return the addr and signer object.
        // ref: https://polkadot.js.org/docs/extension/cookbook#sign-and-send-a-transaction
        const injector = await web3FromSource(source)
        return [address, {signer: injector.signer}]
    }

    const submitNewMessage = async () => {
        setOnSubmitting(true);

        let args;
        if (channelId && commonKey) {
            const { encrypted, nonce } = naclEncrypt(stringToU8a(newMessage), commonKey);
            args = [u8aToHex(encrypted), u8aToHex(nonce), null, null];
        } else {
            const commonKey = randomAsU8a(32);
            console.log('New Common Key Generated', u8aToHex(commonKey));

            const { encrypted, nonce } = naclEncrypt(stringToU8a(newMessage), commonKey);
            args = [u8aToHex(encrypted), u8aToHex(nonce), u8aToHex(commonKey), u8aToHex(commonKey)];
        }

        const fromAcct = await getFromAcct()
        const secret = randomAsU8a(32);
        const messagePreEncryption = stringToU8a(newMessage);
        const noncePreEncryption = randomAsU8a(24);
        const { encrypted } = naclEncrypt(messagePreEncryption, secret, noncePreEncryption);
        
        await api.tx.messaging
            .newMessage(recipient, ...args)
            .signAndSend(...fromAcct, ({status, dispatchError}) => {
                if (status.isInBlock) {
                    setNewMessage('');
                    setOnSubmitting(false);

                    if (!channelId) {
                        reloadMessages();
                    }
                }

                status.isFinalized
                    ? console.log(`😉 Finalized. Block hash: ${status.asFinalized.toString()}`)
                    : console.log(`Current transaction status: ${status.type}`)

                // status would still be set, but in the case of error we can shortcut
                // to just check it (so an error would indicate InBlock or Finalized)
                if (dispatchError) {
                    if (dispatchError.isModule) {
                        // for module errors, we have the section indexed, lookup
                        const decoded = api.registry.findMetaError(dispatchError.asModule);
                        const { section, name } = decoded;

                        console.error(`${section} - ${name}`);
                    } else {
                        // Other, CannotLookup, BadOrigin, no extra info
                        console.error(dispatchError.toString());
                    }
                }
            })
            .catch((err) => {
                setNewMessage('');
                setOnSubmitting(false);
                console.log(`😞 Transaction Failed: ${err.toString()}`)
            });
    }

    const isDisabled = !recipient || onSubmitting;

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

            <div style={{marginTop: 20, marginBottom: 20, maxHeight: 300, overflowX: "auto", paddingRight: 10}}>
                {currentMessages.length === 0 && (<span>No messages</span>)}
                {currentMessages.length > 0 && (
                    currentMessages.map(m => {
                        const isSender = m.sender.toString() === sender;

                        return (
                            <div key={m.id} style={{
                                textAlign: isSender ? "right": "left",
                                backgroundColor: isSender ? "gray": "#798fff",
                                marginBottom: 16,
                                marginLeft: isSender ? 30 : 0,
                                marginRight: isSender ? 0 : 30,
                                padding: 8,
                                borderRadius: 10,
                                color: "white"
                            }}>
                                <p style={{marginBottom: 0}}>{u8aToString(naclDecrypt(m.content.asEncrypted, m.nonce, commonKey))}</p>
                                <small style={{fontStyle: 'italic', fontSize: 10}}>{moment(m.createdAt.toNumber()).fromNow()}</small>
                            </div>
                        )
                    })
                )}
                <div ref={messageEndRef}/>
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
    const {api, keyring} = useSubstrateState()
    return keyring.getPairs && api.query.messaging ? (
        <Main {...props} />
    ) : null
}
