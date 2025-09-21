'use client'

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
// ...existing code...
import { cn } from '@/lib/utils';
import { Send, Sparkles, Loader2, MessageSquare, ShieldCheck } from 'lucide-react';
import type { Message, Conversation, User, Post } from '@/lib/types';
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

// Fetch conversations and messages from backend API
import { useEffect } from 'react';

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
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        if (currentUser?._id) {
            fetchConversations(currentUser._id).then(setConversations);
            fetch(`/api/posts?userId=${currentUser._id}`)
                .then(res => res.json())
                .then(data => setPosts(data.success ? data.data : []));
        }
    }, [currentUser]);

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
        const body = {
            conversationId: selectedConversation._id,
            sentUserId: currentUser._id,
            text: newMessage,
            isEdited: false,
            isDeleted: false,
            deliveredTo: [],
            readBy: [],
            reaction: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const res = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
            setChatHistory(prev => [...prev, data.data]);
            setNewMessage('');
        } else {
            toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
        }
    };

    const handleGenerateDraft = async (intent: string) => {
        if (!selectedConversation) return;
        
        // Find a material from the seller to use as context for the AI
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
            if (result.messageDraft) {
                setNewMessage(result.messageDraft);
            } else {
                toast({
                    title: 'Generation Failed',
                    description: 'The AI could not generate a message draft. Please try again.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error(error);
             toast({
                title: 'An Error Occurred',
                description: 'Something went wrong while generating the message.',
                variant: 'destructive'
            });
        } finally {
            setIsGenerating(false);
        }
    };

  return (
    <div className="h-[calc(100vh-12rem)]">
        <Card className="h-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            <div className="md:col-span-1 lg:col-span-1 border-r h-full flex flex-col">
                <CardHeader>
                    <h2 className="text-xl font-bold">Conversations</h2>
                </CardHeader>
                <ScrollArea className="flex-grow">
                    <div className="space-y-1 p-2">
                        {conversations.map(convo => {
                            // Find the other user in the conversation
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
            <div className="md:col-span-2 lg:col-span-3 h-full flex flex-col">
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
                    <ScrollArea className="flex-grow bg-muted/50 p-4">
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
                                return (
                                    <div key={msg._id ?? msg.createdAt} className={cn("flex items-end gap-2", isCurrentUser ? 'justify-end' : 'justify-start')}>
                                        {!isCurrentUser && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={sender?.avatar} />
                                                <AvatarFallback>{sender?.name?.charAt(0) ?? '?'}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", isCurrentUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card rounded-bl-none')}>
                                            <p>{msg.text}</p>
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
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
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
