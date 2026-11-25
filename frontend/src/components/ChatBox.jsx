import { useState } from 'react'
import { Paperclip, Send, Smile } from 'lucide-react'

function ChatBox({ conversation, onSend }) {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState(conversation.messages || [])

  const sendMessage = () => {
    if (!draft.trim()) return
    setMessages((current) => [
      ...current,
      { sender: 'me', text: draft.trim(), timestamp: 'Now' },
    ])
    if (onSend) onSend(draft.trim())
    setDraft('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-user">
          {conversation.profileImage ? <img src={conversation.profileImage} alt={conversation.name} /> : <span className="conversation-initials">{conversation.name.slice(0, 1)}</span>}
          <div>
            <strong>{conversation.name}</strong>
            <small>{conversation.online ? 'Online now' : 'Last seen recently'}</small>
          </div>
        </div>
        <div className="chat-actions">
          <button type="button" className="icon-button" aria-label="Attach file"><Paperclip size={16} /></button>
          <button type="button" className="icon-button" aria-label="Emoji"><Smile size={16} /></button>
        </div>
      </div>

      <div className="chat-thread">
        {messages.map((message, index) => (
          <div key={`${message.sender}-${index}`} className={`message-row ${message.sender === 'me' ? 'mine' : ''}`}>
            <div className="message-bubble">{message.text}</div>
            <span>{message.timestamp}</span>
          </div>
        ))}
      </div>

      <div className="chat-composer">
        <button type="button" className="icon-button" aria-label="Attach file"><Paperclip size={16} /></button>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          aria-label="Type your message"
        />
        <button type="button" className="button button-dark button-small" onClick={sendMessage}>
          <Send size={14} /> Send
        </button>
      </div>
    </div>
  )
}

export default ChatBox
