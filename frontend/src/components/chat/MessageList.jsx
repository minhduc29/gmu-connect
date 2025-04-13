import { useEffect, useRef } from 'react'

function MessageList({ messages, onLoadMore }) {
    const containerRef = useRef(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleScroll = async () => {
            if (container.scrollTop === 0 && onLoadMore) {
                const prevHeight = container.scrollHeight
                await onLoadMore()
                const newHeight = container.scrollHeight
                container.scrollTop = newHeight - prevHeight
            }
        }

        container.addEventListener('scroll', handleScroll)
        return () => container.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="message-list" ref={containerRef}>
            {messages.map((msg, index) => (
                <div key={index} className="message-left">
                    <div className="message-header">
                        <span className="message-sender">{msg.sender?.username}</span>
                        <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="message-content">{msg.content}</div>
                </div>
            ))}
        </div>
    )
}

export default MessageList
