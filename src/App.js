import React, {createRef} from 'react'
import {Container, Dimmer, Grid, Loader, Message, Sticky,} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import {SubstrateContextProvider, useSubstrateState} from './substrate-lib'
import {DeveloperConsole} from './substrate-lib/components'

import AccountSelector from './AccountSelector'
import Events from './Events'
import Messaging from "./Messaging";
import SubMessage from './submessage'
import Balances from './Balances'
import Transfer from './Transfer'

function Main() {
  const { apiState, apiError, keyringState } = useSubstrateState()

  const loader = text => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  )

  const message = errObj => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`Connection to websocket '${errObj.target.url}' failed.`}
        />
      </Grid.Column>
    </Grid>
  )

  if (apiState === 'ERROR') return message(apiError)
  else if (apiState !== 'READY') return loader('Connecting to Substrate')

  if (keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    )
  }

  const contextRef = createRef()

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector />
      </Sticky>
      <Container>
        <SubMessage />
        { /* <Grid stackable columns="equal">
          <Grid.Row>
            <Events />
            <Messaging />
          </Grid.Row>
        </Grid> */}
        <Grid celled>
          <Grid.Row>
            <Grid.Column width={5}><Transfer /></Grid.Column>
            <Grid.Column width={11}><Balances /></Grid.Column>
          </Grid.Row>
        </Grid>
        <Events />
      </Container>
      <DeveloperConsole />
    </div>
  )
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  )
}
