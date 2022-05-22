import { Input, Icon } from 'semantic-ui-react'

const MessageFooter = ({ inputMessage, setInputMessage, handleSendMessage }) => {
  return (
    <Input fluid placeholder="Type message ..."
      icon={<Icon name='play' inverted circular link />}
      onKeyPress={(e) => {
        if (e.key === "Enter") {
          handleSendMessage()
        }
      }}
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
    />
  )
}

export default MessageFooter
