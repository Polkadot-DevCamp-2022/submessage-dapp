import React, { useState } from "react"
import { useSubstrateState } from '../../substrate-lib'
import { Input, Icon, Progress, Label, Container } from 'semantic-ui-react'
import { stringToU8a, u8aToHex } from '@polkadot/util';
import { web3FromSource } from "@polkadot/extension-dapp";
import { naclEncrypt, randomAsU8a } from '@polkadot/util-crypto';

const MessageSender = ({ handleReloadMessages, recipient,
    channelId, commonKey }) => {
    const { api, currentAccount } = useSubstrateState()
    const [message, setMessage] = useState('');
    const [onSubmitting, setOnSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const onChangeMessage = (_, { value }) => {
        setMessage(value)
    }

    const submitMessage = async () => {
        console.log('channelId', channelId, 'commonKey', commonKey)
        setOnSubmitting(true);

        let args;
        if (channelId && commonKey) {
            const { encrypted, nonce } = naclEncrypt(stringToU8a(message), commonKey);
            args = [u8aToHex(encrypted), u8aToHex(nonce), null, null];
        } else {
            const commonKey = randomAsU8a(32);
            console.log('New Common Key Generated', u8aToHex(commonKey));

            const { encrypted, nonce } = naclEncrypt(stringToU8a(message), commonKey);
            args = [u8aToHex(encrypted), u8aToHex(nonce), u8aToHex(commonKey), u8aToHex(commonKey)];
        }

        const fromAcct = await getFromAcct()
        await api.tx.messaging
            .newMessage(recipient, ...args)
            .signAndSend(...fromAcct, ({ status, dispatchError }) => {
                if (status.isInBlock) {
                    setMessage('');
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
                setMessage('');
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
        <Container>
            <Input fluid
                placeholder="Type message ..."
                icon={<Icon name='play' inverted circular link />}
                disabled={isDisabled}
                onChange={onChangeMessage}
                onKeyPress={(e) => {
                    if (e.key === "Enter") {
                        submitMessage()
                    }
                }}
                value={message}

            />
            {onSubmitting && <Progress percent={100} active size="tiny" />}
            {errorMessage && <Label basic color='red' pointing>{errorMessage}</Label>}
        </Container>

    )
}

export default MessageSender