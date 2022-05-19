import { Grid } from 'semantic-ui-react'
import { NewMessage, Contacts, Conversation } from './components'

const SubMessage = () => <Grid celled>
  <Grid.Row>
    <Grid.Column width={5}>
      <Grid.Row>
        <Grid.Column>
          <NewMessage />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Contacts />
        </Grid.Column>
      </Grid.Row>
    </Grid.Column>
    <Grid.Column width={10}>
      <Conversation />
    </Grid.Column>
  </Grid.Row>
</Grid>


export default SubMessage