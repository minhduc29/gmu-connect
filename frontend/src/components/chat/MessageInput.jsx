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
      <textarea
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
        placeholder="Type a message..."
        className="form-input scroll-hidden"
      />
      <button type="submit" className="chat-button green-button">Send</button>
    </form>
  )
}

export default MessageInput
