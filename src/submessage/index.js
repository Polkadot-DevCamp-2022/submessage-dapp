import { Grid } from 'semantic-ui-react'
import { NewMessage, Contacts, Chat } from './components'

const SubMessage = () => {
  const handleReloadMessages = () => {
    console.log('handleReloadMessages')
  }

  return (<Grid celled>
    <Grid.Row>
      <Grid.Column width={5}>
        <Grid.Row>
          <Grid.Column>
            <NewMessage handleReloadMessages={handleReloadMessages} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Contacts />
          </Grid.Column>
        </Grid.Row>
      </Grid.Column>
      <Grid.Column width={11}>
        <Chat />
      </Grid.Column>
    </Grid.Row>
  </Grid>)
}


export default SubMessage