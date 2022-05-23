import React, { useState } from "react"
import { useSubstrateState } from '../../substrate-lib'
import { Form, Input, Icon, Dropdown, Progress, Label } from 'semantic-ui-react'
import { stringToU8a, u8aToHex } from '@polkadot/util';
import { web3FromSource } from "@polkadot/extension-dapp";
import { naclEncrypt,randomAsU8a } from '@polkadot/util-crypto';

const NewMessage = ( { handleReloadMessages } ) => {
    const { api, keyring, currentAccount } = useSubstrateState()
    const { address: sender } = currentAccount || {}
    const [recipient, setRecipient] = useState()
    const [newMessage, setNewMessage] = useState('');
    const [onSubmitting, setOnSubmitting] = useState(false);
    const [channelId, setChannelId] = useState();
    const [commonKey, setCommonKey] = useState();
    const [errorMessage, setErrorMessage] = useState('');

    const keyringOptions = keyring.getPairs()
        .filter(account => account.address !== sender)
        .map(account => ({
            key: account.address,
            value: account.address,
            text: `${account.meta.name.toUpperCase()} - ${account.address.slice(0, 5)}...${account.address.slice(account.address.length - 5, account.address.length)}`,
        }))

    const onChangeRecipient = (_, data) => {
        setRecipient(data.value)
        console.log('selected recipient address', data.value)
    }

    const onChangeNewMessage = (_, { value }) => {
        setNewMessage(value)
        console.log('message', value)
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
        await api.tx.messaging
            .newMessage(recipient, ...args)
            .signAndSend(...fromAcct, ({ status, dispatchError }) => {
                if (status.isInBlock) {
                    setNewMessage('');
                    setErrorMessage('');
                    setOnSubmitting(false);

                    handleReloadMessages()
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
                        setErrorMessage(`Error in ${section} - ${name}`);    
                        console.error(`${section} - ${name}`);
                    } else {
                        // Other, CannotLookup, BadOrigin, no extra info
                        setErrorMessage(dispatchError.toString());
                        console.error(dispatchError.toString());
                    }
                }
            })
            .catch((err) => {
                setNewMessage('');
                setOnSubmitting(false);
                setErrorMessage(`😞 Transaction Failed: ${err.toString()}`);
                console.log(`😞 Transaction Failed: ${err.toString()}`)
            });
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
        return [address, { signer: injector.signer }]
    }

    const isDisabled = !recipient || onSubmitting;

    return (
        <Form>
            <Form.Field>
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
            </Form.Field>
            <Form.Field>
                <Input placeholder="Type message ..." 
                    icon={<Icon name='play' inverted circular link />} 
                    disabled={isDisabled}
                    onChange={onChangeNewMessage}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            submitNewMessage()
                        }
                      }}
                    value={newMessage}
                    
                />
                { onSubmitting && <Progress percent={100} active size="tiny" /> }
                { errorMessage && <Label basic color='red' pointing>{errorMessage}</Label> }
            </Form.Field>
        </Form>
    )
}

export default NewMessage