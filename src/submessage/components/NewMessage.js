import { Form, Input, Icon } from 'semantic-ui-react'

const NewMessage = () => (
    <Form>
        <Form.Field>
            <Input icon='user' iconPosition='left' placeholder="Address" />
        </Form.Field>
        <Form.Field>
            <Input placeholder="Type message ..." icon={<Icon name='play' inverted circular link />} />
        </Form.Field>
    </Form>
)

export default NewMessage