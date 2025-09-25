'use client'

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, Sparkles, Loader2, MessageSquare, ShieldCheck } from 'lucide-react';
import type { Message, Post, Reaction } from '@/lib/types';
import { getDraftMessage } from '../actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getSocket } from '@/lib/socket';
import { createPortal } from 'react-dom';

// Fetch conversations and messages from backend API
async function fetchConversations(userId: string) {
  const res = await fetch(`/api/messages/conversations?userId=${userId}`);
  const data = await res.json();
  return data.success ? data.data : [];
}

async function fetchMessages(conversationId: string) {
  const res = await fetch(`/api/messages?conversationId=${conversationId}`);
  const data = await res.json();
  return data.success ? data.data : [];
}

export default function MessagesPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null); // message id
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch conversations and posts
  useEffect(() => {
    if (currentUser?._id) {
      fetchConversations(currentUser._id).then(setConversations);
      fetch(`/api/posts?userId=${currentUser._id}`)
        .then(res => res.json())
        .then(data => setPosts(data.success ? data.data : []));
    }
  }, [currentUser]);

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (selectedConversation?._id) {
      socket.emit('joinRoom', selectedConversation._id);
      socket.on('newMessage', (msg: Message) => {
        if (msg.conversationId === selectedConversation._id) {
          setChatHistory(prev => [...prev, msg]);
        }
      });
      socket.on('messageUpdated', (msg: Message) => {
        if (msg.conversationId === selectedConversation._id) {
          setChatHistory(prev => prev.map(m => m._id === msg._id ? msg : m));
        }
      });
    }
    return () => {
      socket.off('newMessage');
      socket.off('messageUpdated');
    };
  }, [selectedConversation]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Please log in to view your messages.</p>
      </div>
    );
  }

  const handleSelectConversation = async (convo: any) => {
    setSelectedConversation(convo);
    const messages = await fetchMessages(convo._id);
    setChatHistory(messages);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    const msg: Message = {
      _id: Date.now().toString(),
      conversationId: selectedConversation._id,
      sentUserId: currentUser._id,
      text: newMessage,
      isEdited: false,
      isDeleted: false,
      deliveredTo: [],
      readBy: [],
      reactions: [],
      replyTo: replyTo?._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    getSocket().emit('sendMessage', msg);
    setNewMessage('');
    setReplyTo(null);
  };

  const handleGenerateDraft = async (intent: string) => {
    if (!selectedConversation) return;
    const materialContext = posts.find(m => m.owner === selectedConversation.participant.id);
    if (!materialContext) {
      toast({
        title: 'Cannot Generate Draft',
        description: 'Could not find a sample item from this seller to discuss.',
        variant: 'destructive'
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await getDraftMessage({
        userIntent: intent,
        sellerName: selectedConversation.participant.name,
        materialName: materialContext.title,
      });
      if (result.messageDraft) setNewMessage(result.messageDraft);
      else toast({ title: 'Generation Failed', description: 'The AI could not generate a message draft. Please try again.', variant: 'destructive' });
    } catch {
      toast({ title: 'An Error Occurred', description: 'Something went wrong while generating the message.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  function handleAddReaction(messageId: string, emoji: string) {
    if (!currentUser) return;
    getSocket().emit('addReaction', { messageId, emoji, userId: currentUser._id });
    setShowEmojiPicker(null);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <Card className="flex flex-grow min-h-0 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-1 lg:col-span-1 border-r flex flex-col">
          <CardHeader><h2 className="text-xl font-bold">Conversations</h2></CardHeader>
          <ScrollArea className="flex-grow">
            <div className="space-y-1 p-2">
              {conversations.map(convo => {
                const otherUser = convo.users.find((u: any) => u.userId !== currentUser._id);
                return (
                  <Button
                    key={convo._id}
                    variant={convo._id === selectedConversation?._id ? 'secondary' : 'ghost'}
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handleSelectConversation(convo)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={otherUser?.avatar} />
                        <AvatarFallback>{otherUser?.name?.charAt(0) ?? '?'}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-semibold">{otherUser?.name ?? 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[150px]">{convo.lastMessage?.text ?? ''}</p>
                      </div>
                      {convo.unreadCount > 0 && <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{convo.unreadCount}</span>}
                    </div>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

  <div className="md:col-span-2 lg:col-span-3 flex flex-col flex-grow min-h-0">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  {(() => {
                    const otherUser = selectedConversation.users.find((u: any) => u.userId !== currentUser._id);
                    return (
                      <>
                        <Avatar>
                          <AvatarImage src={otherUser?.avatar} />
                          <AvatarFallback>{otherUser?.name?.charAt(0) ?? '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">{otherUser?.name ?? 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">Online</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardHeader>

              <ScrollArea className="flex-grow min-h-0 bg-muted/50 p-4">
                <Alert className="mb-4 bg-primary/10 border-primary/20">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <AlertTitle className="font-semibold text-primary">Trade with Confidence</AlertTitle>
                  <AlertDescription className="text-primary/80">
                    Keep your conversations and transactions on PlanetBuild to stay protected. Never share personal contact information.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {chatHistory.map((msg) => {
                    const sender = selectedConversation.users.find((u: any) => u.userId === msg.sentUserId);
                    const isCurrentUser = msg.sentUserId === currentUser._id;
                    const repliedMsg = msg.replyTo ? chatHistory.find(m => m._id === msg.replyTo) : null;
                    const reactionGroups = msg.reactions?.reduce((acc: Record<string, string[]>, r: Reaction) => {
                      acc[r.emoji] = acc[r.emoji] || [];
                      acc[r.emoji].push(r.userId);
                      return acc;
                    }, {}) || {};

                    return (
                      <div key={msg._id ?? msg.createdAt} className={cn("flex items-end gap-2", isCurrentUser ? 'justify-end' : 'justify-start', 'group')}>
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={sender?.avatar} />
                            <AvatarFallback>{sender?.name?.charAt(0) ?? '?'}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", isCurrentUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card rounded-bl-none', 'relative')}>

                          {repliedMsg && (
                            <div className="text-xs text-gray-900 bg-gray-200 border-l-2 border-primary p-2 mb-1 rounded opacity-90">
                              <span className="font-semibold">
                                {selectedConversation.users.find((u: any) => u.userId === repliedMsg.sentUserId)?.name || 'User'}:
                              </span> {repliedMsg.text}
                            </div>
                          )}

                          <p>{msg.text}</p>

                          <button
                            className="absolute top-1 right-1 text-xs text-muted-foreground hover:underline"
                            title="Reply"
                            onClick={() => setReplyTo(msg)}
                          >↩</button>

                          {/* Reactions */}
                            <div
                              ref={(el) => { messageRefs.current[msg._id] = el }}
                              className={cn("max-w-xs md:max-w-md p-1 rounded-lg relative", isCurrentUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card rounded-bl-none')}
                              onMouseEnter={() => {
                                const el = messageRefs.current[msg._id];
                                if (el) {
                                  const rect = el.getBoundingClientRect();
                                  const POPUP_WIDTH = 220; // increased width
                                  let left = rect.left + window.scrollX;
                                  const viewportWidth = window.innerWidth;
                                  if (left + POPUP_WIDTH > viewportWidth) left = viewportWidth - POPUP_WIDTH - 8;
                                  setPopupPosition({ top: rect.bottom + window.scrollY + 4, left });
                                }
                                setShowEmojiPicker(msg._id);
                              }}
                              onMouseLeave={() => setShowEmojiPicker(null)}
                            >
                            {Object.entries(reactionGroups).map(([emoji, users]) => (
                              <span
                                key={emoji}
                                className={cn("px-1 py-0.5 rounded text-xs cursor-pointer",
                                  (users as string[]).includes(currentUser._id) ? "bg-primary/20" : "bg-muted")}
                                title={(users as string[]).map(uid => selectedConversation.users.find((u: any) => u.userId === uid)?.name).join(", ")}
                                onClick={() => handleAddReaction(msg._id, emoji)}
                              >
                                {emoji} x{(users as string[]).length}
                              </span>
                            ))}

                            {/* "+" button only if there’s at least one emoji */}
                            {Object.keys(reactionGroups).length > 0 && (
                              <span
                                className="px-1 py-1 rounded text-xs cursor-pointer bg-muted hover:bg-primary/10"
                                onClick={() => handleAddReaction(msg._id, "+")}
                              >
                                +
                              </span>
                            )}

                            {/* Emoji picker portal */}
                            {showEmojiPicker === msg._id && createPortal(
                              <div
                                style={{
                                  position: 'absolute',
                                  top: popupPosition.top,
                                  left: popupPosition.left,
                                  width: 220,
                                  zIndex: 9999,
                                }}
                                className="bg-white border rounded shadow p-2 flex flex-wrap gap-1"
                              >
                                {["👍", "😂", "❤️", "🎉", "😮", "😢", "🙏"].map(e => (
                                  <span
                                    key={e}
                                    className="cursor-pointer text-lg"
                                    onClick={() => handleAddReaction(msg._id, e)}
                                  >
                                    {e}
                                  </span>
                                ))}
                              </div>,
                              document.body
                            )}
                          </div>
                        </div>
                        {isCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.avatar} />
                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <CardContent className="pt-6 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                  {replyTo && (
                    <div className="absolute -top-10 left-0 w-full flex items-center gap-2 bg-muted/80 rounded p-2 border text-xs">
                      <span className="font-semibold">Replying to:</span> {replyTo.text}
                      <button type="button" className="ml-auto text-muted-foreground hover:underline" onClick={() => setReplyTo(null)}>Cancel</button>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="flex-shrink-0" disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Generate with AI</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => handleGenerateDraft('Ask about availability')}>Ask about availability</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleGenerateDraft('Ask for more details')}>Ask for more details</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleGenerateDraft('Arrange a viewing')}>Arrange a viewing</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => handleGenerateDraft('Arrange pickup')}>Arrange pickup</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={isGenerating}/>
                  <Button type="submit" size="icon" className="flex-shrink-0" disabled={!newMessage.trim() || isGenerating}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
              <MessageSquare className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold">Select a conversation</h3>
              <p>Choose a conversation from the left to start messaging.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
