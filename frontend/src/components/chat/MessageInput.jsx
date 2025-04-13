import { useState } from 'react'

function MessageInput({ onSend }) {
  const [content, setContent] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (content.trim()) {
      onSend(content.trim())
      setContent('')
    }
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="message-textbox"
      />
      <button type="submit" className="send-button">Send</button>
    </form>
  )
}

export default MessageInput
