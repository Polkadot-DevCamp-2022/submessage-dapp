import React, { useState } from "react"
import { useSubstrateState } from '../../substrate-lib'
import { Form, Input, Icon, Dropdown } from 'semantic-ui-react'

const NewMessage = () => {
    const { api, keyring, currentAccount } = useSubstrateState()
    const {address: sender} = currentAccount || {}
    const [recipient, setRecipient] = useState()

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
                <Input placeholder="Type message ..." icon={<Icon name='play' inverted circular link />} />
            </Form.Field>
        </Form>
    )
}

export default NewMessage