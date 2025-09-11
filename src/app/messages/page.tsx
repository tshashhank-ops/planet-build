'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { conversations, users, materials } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Send, Sparkles, Loader2, MessageSquare, ShieldCheck } from 'lucide-react';
import type { Message, Conversation, User } from '@/lib/types';
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

// Static chat history for demonstration
const initialChatHistory: Message[] = [
    { id: 1, senderId: 2, text: "Hi there! I'm interested in the Reclaimed Douglas Fir Beams. Are they still available?", timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 2, senderId: 1, text: "Hello! Yes, they are. They're in great condition.", timestamp: new Date(Date.now() - 4 * 60000).toISOString() },
    { id: 3, senderId: 2, text: "Excellent. Could I arrange a time to come see them this week?", timestamp: new Date(Date.now() - 3 * 60000).toISOString() },
];

export default function MessagesPage() {
    const { toast } = useToast();
    const [currentUser] = useState<User | null>(users[0]); // Mock current user
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
    const [chatHistory, setChatHistory] = useState<Message[]>(initialChatHistory);
    const [newMessage, setNewMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Please log in to view your messages.</p>
            </div>
        );
    }
    
    const handleSelectConversation = (convo: Conversation) => {
        setSelectedConversation(convo);
        // In a real app, you'd fetch the chat history for this conversation
        setChatHistory(initialChatHistory); 
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        const message: Message = {
            id: chatHistory.length + 1,
            senderId: currentUser.id,
            text: newMessage,
            timestamp: new Date().toISOString(),
        }
        setChatHistory(prev => [...prev, message]);
        setNewMessage('');
    };

    const handleGenerateDraft = async (intent: string) => {
        if (!selectedConversation) return;
        
        // Find a material from the seller to use as context for the AI
        const materialContext = materials.find(m => m.sellerId === selectedConversation.participant.id);
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
                materialName: materialContext.name,
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
                        {conversations.map(convo => (
                            <Button 
                                key={convo.id} 
                                variant={convo.id === selectedConversation?.id ? 'secondary' : 'ghost'} 
                                className="w-full justify-start h-auto py-3"
                                onClick={() => handleSelectConversation(convo)}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={convo.participant.avatar} data-ai-hint={convo.participant.dataAiHint} />
                                        <AvatarFallback>{convo.participant.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left">
                                        <p className="font-semibold">{convo.participant.name}</p>
                                        <p className="text-sm text-muted-foreground truncate max-w-[150px]">{convo.lastMessage.text}</p>
                                    </div>
                                    {convo.unreadCount > 0 && <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{convo.unreadCount}</span>}
                                </div>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            <div className="md:col-span-2 lg:col-span-3 h-full flex flex-col">
                {selectedConversation ? (
                    <>
                    <CardHeader className="border-b">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={selectedConversation.participant.avatar} data-ai-hint={selectedConversation.participant.dataAiHint} />
                                <AvatarFallback>{selectedConversation.participant.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{selectedConversation.participant.name}</p>
                                <p className="text-sm text-muted-foreground">Online</p>
                            </div>
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
                            {chatHistory.map((msg) => (
                                <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === currentUser.id ? 'justify-end' : 'justify-start')}>
                                    {msg.senderId !== currentUser.id && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={selectedConversation.participant.avatar} data-ai-hint={selectedConversation.participant.dataAiHint} />
                                            <AvatarFallback>{selectedConversation.participant.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", msg.senderId === currentUser.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card rounded-bl-none')}>
                                        <p>{msg.text}</p>
                                    </div>
                                    {msg.senderId === currentUser.id && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={currentUser.avatar} data-ai-hint={currentUser.dataAiHint} />
                                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
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
