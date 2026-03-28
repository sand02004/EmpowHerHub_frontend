import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Search, Users as UsersIcon, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

/* ── Types ──────────────────────────────────────────────────────────────── */
interface APIMessage {
  id: string;
  senderId: string;
  sender?: { id: string; firstName: string; lastName: string; role: string };
  content: string;
  createdAt: string;
}

interface APIConversation {
  id: string;
  user1: { id: string; firstName: string; lastName: string; role: string };
  user2: { id: string; firstName: string; lastName: string; role: string };
  lastMessage: string | null;
  lastMessageTime: string | null;
  updatedAt: string;
}

interface Conversation {
  id: string;
  receiverId: string;
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
  lastMessage: string;
  time: string;
  rawTime: number;
  unread: number;
}

interface UIMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
}

/* ── Conversation list item ─────────────────────────────────────────────── */
const ConversationItem = ({ conv, isActive, onClick }: { conv: Conversation; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
      isActive ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent hover:bg-gray-50'
    }`}
  >
    <div className={`h-11 w-11 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${conv.avatarColor}`}>
      {conv.initials}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className={`font-bold text-sm truncate ${isActive ? 'text-primary' : 'text-gray-900'}`}>{conv.name}</p>
        <span className="text-[11px] text-gray-400 shrink-0">{conv.time}</span>
      </div>
      <div className="flex items-center justify-between gap-2 mt-0.5">
        <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
        {conv.unread > 0 && (
          <span className="h-4.5 min-w-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {conv.unread}
          </span>
        )}
      </div>
    </div>
  </button>
);

/* ── Message bubble ─────────────────────────────────────────────────────── */
const Bubble = ({ msg }: { msg: UIMessage }) => (
  <div className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[72%] px-4 py-3 rounded-2xl text-sm shadow-xs ${
        msg.sender === 'me'
          ? 'bg-primary text-white rounded-br-sm'
          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
      }`}
    >
      <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
      <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-white/60' : 'text-gray-400'}`}>
        {msg.time}
      </p>
    </div>
  </div>
);

/* ── Root export ────────────────────────────────────────────────────────── */

export const Messages = () => {
  const { user, role } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // New Chat Directory State
  const [showDir, setShowDir] = useState(false);
  const [directoryUsers, setDirectoryUsers] = useState<any[]>([]);
  const [dirSearch, setDirSearch] = useState('');

  // Refs for polling stability
  const activeIdRef = useRef<string>('');
  const initialLoadDone = useRef(false);

  // Initialize Notification Request
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await api.get(`/messages/conversations/${convId}`);
      const mappedMsgs: UIMessage[] = res.data.map((m: APIMessage) => ({
        id: m.id,
        sender: m.senderId === user?.sub ? 'me' : 'other',
        text: m.content,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(mappedMsgs);
    } catch (err) {
      // suppress polling errors silently
    }
  }, [user?.sub]);

  // Polling Engine
  useEffect(() => {
    if (!user?.sub) return;

    const fetchConvs = async () => {
      try {
        const res = await api.get('/messages/conversations');
        const mapped = res.data.map((c: APIConversation) => {
          const otherUser = c.user1.id === user.sub ? c.user2 : c.user1;
          const tDate = c.lastMessageTime ? new Date(c.lastMessageTime) : new Date(c.updatedAt);
          return {
            id: c.id,
            receiverId: otherUser.id,
            name: `${otherUser.firstName} ${otherUser.lastName}`,
            initials: `${otherUser.firstName[0]}${otherUser.lastName?.[0] || ''}`,
            role: otherUser.role,
            avatarColor: 'bg-primary/10 text-primary',
            lastMessage: c.lastMessage || 'No messages yet',
            time: tDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rawTime: tDate.getTime(),
            unread: 0,
          };
        });

        setConversations(prev => {
          // Check for notifications
          if (prev.length > 0) {
            mapped.forEach((newC: Conversation) => {
              const oldC = prev.find(p => p.id === newC.id);
              // If we have a new timestamp on an existing or new conversation
              if (!oldC || newC.rawTime > oldC.rawTime) {
                // Determine if we should alert
                if (activeIdRef.current !== newC.id || document.hidden) {
                  if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(`New message from ${newC.name}`, { body: newC.lastMessage });
                  }
                }
              }
            });
          }
          
          // Preserve any "ghost" conversations we locally created via 'Start New Chat' 
          // that haven't synchronized a sent message via DB yet
          const ghosts = prev.filter(c => 
            c.id.startsWith('new-') && 
            !mapped.some((m: Conversation) => m.receiverId === c.receiverId)
          );

          return [...ghosts, ...mapped];
        });

        // Initialize first open view
        if (mapped.length > 0 && !activeIdRef.current && !initialLoadDone.current) {
          activeIdRef.current = mapped[0].id;
          setActiveId(mapped[0].id);
          fetchMessages(mapped[0].id);
        }
        initialLoadDone.current = true;
      } catch (err) {
        // Suppress network polling errors
      }
    };

    fetchConvs();
    
    const interval = setInterval(() => {
      fetchConvs();
      if (activeIdRef.current) {
        fetchMessages(activeIdRef.current);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [user?.sub, fetchMessages]);

  const handleSelectConv = (conv: Conversation) => {
    setActiveId(conv.id);
    activeIdRef.current = conv.id;
    setText('');
    fetchMessages(conv.id);
  };

  const handleStartNewChat = async () => {
    try {
      const res = await api.get('/users');
      setDirectoryUsers(res.data.filter((u: any) => u.id !== user?.sub));
      setShowDir(true);
    } catch(err) {
      console.error('Failed to grab user directory', err);
    }
  };

  const startChatWithUser = async (targetUser: any) => {
    // Check if conversation already exists locally
    const existing = conversations.find(c => c.receiverId === targetUser.id);
    if (existing) {
      handleSelectConv(existing);
      setShowDir(false);
      return;
    }
    
    // Send a blank/initial ping to instantiate to DB or handle dynamically
    // In our backend, sending a message creates the conversation. To avoid empty phantom convs, 
    // we'll just prepopulate the local state and let the user send the first message!
    const ghostConvId = 'new-' + targetUser.id;
    const newGhost: Conversation = {
      id: ghostConvId,
      receiverId: targetUser.id,
      name: `${targetUser.firstName} ${targetUser.lastName}`,
      initials: `${targetUser.firstName[0]}${targetUser.lastName?.[0] || ''}`,
      role: targetUser.role,
      avatarColor: 'bg-primary/10 text-primary',
      lastMessage: 'Drafting new message...',
      time: 'Now',
      rawTime: Date.now(),
      unread: 0
    };
    
    setConversations(prev => [newGhost, ...prev]);
    handleSelectConv(newGhost);
    setMessages([]);
    setShowDir(false);
  };

  const activeConv = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    
    const savedText = text.trim();
    setText('');
    
    try {
      const payload = { receiverId: activeConv.receiverId, content: savedText };
      const res = await api.post('/messages/send', payload);
      
      const newMsg: UIMessage = {
        id: res.data.id,
        sender: 'me',
        text: res.data.content,
        time: new Date(res.data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, newMsg]);
      
      // We'll let the polling naturally re-sync the conversation ID if it was a ghost-conversation
      if (activeId.startsWith('new-')) {
         activeIdRef.current = res.data.conversationId;
         setActiveId(res.data.conversationId);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredDir = directoryUsers.filter((u: any) => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(dirSearch.toLowerCase()) || 
    u.role?.toLowerCase().includes(dirSearch.toLowerCase())
  );

  if (role === 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Messaging</h2>
          <p className="text-gray-500 max-w-sm">
            Admins communicate through the admin panel. Direct messaging between users is monitored but not initiated from here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[500px] bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      {/* ── Left: Conversation List ─────────────────────────────────────── */}
      <div className="w-80 shrink-0 border-r border-gray-100 flex flex-col bg-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-gray-900">Messages</h2>
            <Button variant="ghost" className="h-8 w-8 !p-0" onClick={handleStartNewChat} aria-label="Start new chat">
              <MessageSquarePlus className="h-5 w-5 text-primary" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeId}
              onClick={() => handleSelectConv(conv)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500">
               <p className="text-sm font-medium">No active chats</p>
               <Button onClick={handleStartNewChat} variant="primary" className="mt-4 w-full text-xs">Start a Conversation</Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Chat area ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        {activeConv ? (
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-white shrink-0">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${activeConv.avatarColor}`}>
              {activeConv.initials}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{activeConv.name}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{activeConv.role}</p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-center bg-white shrink-0">
             <p className="text-sm text-gray-400 font-medium">Select a conversation or start a new chat</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/60 flex flex-col">
          {!activeConv && (
             <div className="flex-1 flex items-center justify-center">
                <UsersIcon className="h-16 w-16 text-gray-200" />
             </div>
          )}
          {messages.map((m) => <Bubble key={m.id} msg={m} />)}
          {activeConv && messages.length === 0 && !activeConv.id.startsWith('new-') && (
            <div className="text-center text-gray-400 text-sm py-4">This is the start of your message history.</div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {activeConv && (
        <form
          onSubmit={handleSend}
          className="px-5 py-4 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message…"
            autoFocus
            className="flex-1 px-5 py-3 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        )}
      </div>

      {/* ── Directory Modal ───────────────────────────────────────────── */}
      <Modal isOpen={showDir} onClose={() => setShowDir(false)} title="Start New Conversation" size="md">
         <div className="space-y-4 pt-2">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
               <input
                 type="text"
                 value={dirSearch}
                 onChange={(e) => setDirSearch(e.target.value)}
                 placeholder="Search name or role..."
                 autoFocus
                 className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
               />
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
               {filteredDir.map(u => (
                 <button 
                   key={u.id}
                   onClick={() => startChatWithUser(u)}
                   className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                 >
                   <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                      {u.firstName[0]}{u.lastName?.[0] || ''}
                   </div>
                   <div>
                      <p className="font-bold text-gray-900 text-sm">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-500 font-medium uppercase">{u.role}</p>
                   </div>
                 </button>
               ))}
               {filteredDir.length === 0 && (
                 <p className="text-center text-sm text-gray-500 py-6">No users found.</p>
               )}
            </div>
         </div>
      </Modal>
    </div>
  );
};

