import { useEffect, useRef } from 'react'
import { USERNAME } from '../../constants'

function MessageList({ messages, onLoadMore }) {
    const containerRef = useRef(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        // const handleScroll = async () => {
        //     if (container.scrollTop === 0 && onLoadMore) {
        //         const prevHeight = container.scrollHeight
        //         await onLoadMore()
        //         const newHeight = container.scrollHeight
        //         container.scrollTop = newHeight - prevHeight
        //     }
        // }

        // container.addEventListener('scroll', handleScroll)
        // return () => container.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [messages])

    return (
        <div className="message-list scroll-hidden" ref={containerRef}>
            {messages.map((msg, index) => (
                <div key={index} className={`message-item ${msg.sender?.username === localStorage.getItem(USERNAME) ? 'sent' : 'received'}`}>
                    <span className="green">{msg.sender?.username}</span>
                    <div className="message-content">{msg.content}</div>
                    <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                        })}
                    </span>
                </div>
            ))}
        </div>
    )
}

export default MessageList
