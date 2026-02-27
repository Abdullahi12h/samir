import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import api from '../utils/api';
import { Send, ShieldCheck } from 'lucide-react';

// Use same host as the API but different protocol if needed
const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:5001' : window.location.origin.replace('3000', '5001').replace('5173', '5001');
const socket = io(SOCKET_URL);

const ChatWindow = ({ orderId, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/orders/${orderId}/messages`);
                setMessages(data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

        socket.emit('join_order', orderId);

        socket.on('receive_message', (message) => {
            // Check if message belongs to this order
            const msgOrderId = typeof message.order === 'object' ? message.order?._id : message.order;
            if (msgOrderId?.toString() === orderId?.toString()) {
                setMessages((prev) => {
                    // Avoid duplicates
                    if (prev.some(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            }
        });

        return () => {
            socket.off('receive_message');
        };
    }, [orderId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await api.post(`/orders/${orderId}/messages`, { text: newMessage });
            // Backend now handles the socket emission
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`flex ${msg.sender?._id === currentUser?._id ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${msg.sender?._id === currentUser?._id
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                                    {msg.sender?.role === 'Admin' ? 'Admin' : (msg.sender?.name || 'Unknown User')}
                                </span>
                                {msg.sender?.role === 'Admin' && <ShieldCheck size={12} className="opacity-75" />}
                            </div>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <span className="text-[10px] mt-1 block opacity-60 text-right">
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Wada sheekaysiga kabilow halkan..."
                    className="flex-1 px-4 py-2 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                    type="submit"
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
