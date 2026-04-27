import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const SOCKET_URL = 'http://localhost:5000';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('with');
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // partner object
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socket = useRef(null);

  const [showSidebar, setShowSidebar] = useState(true);

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/messages/chats');
      setChats(data);
      
      if (targetUserId) {
        const existingChat = data.find(c => c.partner._id === targetUserId);
        if (existingChat) {
          setActiveChat(existingChat.partner);
          setShowSidebar(false);
        } else {
          try {
            const res = await api.get(`/profiles/${targetUserId}`);
            setActiveChat(res.data.profile.userId);
            setShowSidebar(false);
          } catch (err) {
            console.error("Could not fetch target user info", err);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      const { data } = await api.get(`/messages/${partnerId}`);
      
      // Handle both formats: old [msg1, msg2] and new { messages: [], partner: {} }
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages(data.messages || []);
        // Sync activeChat info if it's more complete from this call
        if (data.partner && (!activeChat?.username || activeChat._id !== data.partner._id)) {
          setActiveChat(data.partner);
        }
      }
    } catch (err) {
      console.error("Fetch Messages Error:", err);
    }
  };

  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Socket setup
  useEffect(() => {
    if (user) {
      socket.current = io(SOCKET_URL);
      socket.current.emit('join', user._id);

      socket.current.on('new_message', (message) => {
        const currentActiveChat = activeChatRef.current;
        
        // If message is from/to current active chat, update messages list
        setMessages((prev) => {
          const isRelevant = currentActiveChat && (
            message.sender._id.toString() === currentActiveChat._id.toString() || 
            message.receiver._id.toString() === currentActiveChat._id.toString()
          );
          
          // Check if message already exists
          const exists = prev.some(m => m._id === message._id);
          if (isRelevant && !exists) {
            return [...prev, message];
          }
          return prev;
        });

        // Always refresh chats list
        fetchChats();
      });

      return () => {
        if (socket.current) {
          socket.current.off('new_message');
          socket.current.disconnect();
        }
      };
    }
  }, [user]); // Only depend on user, use Ref for activeChat

  useEffect(() => {
    fetchChats();
  }, [targetUserId]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
    }
  }, [activeChat?._id]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSelectChat = (partner) => {
    setActiveChat(partner);
    setShowSidebar(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const { data } = await api.post('/messages', {
        receiverId: activeChat._id,
        content: newMessage,
      });
      // We don't manually add to messages here because the socket will catch it
      // but to make it feel snappier, we can add it if it's not already there
      setMessages(prev => {
        if (prev.some(m => m._id === data._id)) return prev;
        return [...prev, data];
      });
      setNewMessage('');
      fetchChats();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loader-wrapper"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container messages-container glass-card">
        {/* Sidebar */}
        <div className={`messages-sidebar ${showSidebar ? 'active' : ''}`}>
          <div className="sidebar-header">
            <h3>💬 Messages</h3>
          </div>
          <div className="chats-list">
            {chats.length === 0 ? (
              <div className="empty-chats-box">
                <p className="empty-chats">No conversations yet.</p>
                <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Discover students to start chatting!</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.partner?._id}
                  className={`chat-item ${activeChat?._id === chat.partner?._id ? 'active' : ''}`}
                  onClick={() => handleSelectChat(chat.partner)}
                >
                  <div className="chat-avatar">
                    {chat.partner?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">{chat.partner?.username}</div>
                    <div className="chat-last-msg">
                      {chat.lastMessage?.content}
                    </div>
                  </div>
                  {!chat.lastMessage?.read && chat.lastMessage?.receiver?.toString() === user._id?.toString() && (
                    <div className="unread-dot" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`chat-window ${!showSidebar ? 'active' : ''}`}>
          {activeChat ? (
            <>
              <div className="chat-header">
                <div className="chat-partner-info">
                  <button className="back-btn" onClick={() => setShowSidebar(true)}>←</button>
                  <div className="partner-avatar">
                    {activeChat.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="partner-name">{activeChat.username}</div>
                    <div className="partner-role">{activeChat.role}</div>
                  </div>
                </div>
              </div>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="no-messages-yet">
                    <div className="no-chat-icon">👋</div>
                    <p>Start your conversation with {activeChat.username}!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSentByMe = m.sender?._id?.toString() === user._id?.toString() || 
                                     m.sender?.toString() === user._id?.toString();
                    return (
                      <div
                        key={m._id}
                        className={`message-wrapper ${isSentByMe ? 'sent' : 'received'}`}
                      >
                        <div className="message-bubble">
                          {m.content}
                          <div className="message-time">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-area" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="form-input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">Send</button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">✉️</div>
              <h3>Your Messages</h3>
              <p>Select a conversation to start messaging recruiters or students.</p>
              <button className="btn btn-secondary btn-sm mobile-only" onClick={() => setShowSidebar(true)} style={{marginTop: '1rem'}}>
                View Conversations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
