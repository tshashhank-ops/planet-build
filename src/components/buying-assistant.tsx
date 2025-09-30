'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Loader2, Send, ChevronDown } from 'lucide-react';
import { getBuyingAssistance } from '@/app/actions';
import type { Material, User } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BuyingAssistantProps {
  post: Material;
  seller: User;
}

export default function BuyingAssistant({ post: material, seller }: BuyingAssistantProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assistance, setAssistance] = useState<{ response: string; steps: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);
    setError(null);
    setAssistance(null);

    try {
      const result = await getBuyingAssistance({
        materialName: material.name,
        materialDescription: material.description,
        sellerName: seller.name,
        userQuery: query,
      });
      if (result) {
        setAssistance({ response: result.assistantResponse, steps: result.suggestedNextSteps });
      } else {
        setError('Failed to get a response. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-secondary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="text-primary" />
          <span>AI Buying Assistant</span>
        </CardTitle>
        <CardDescription>
          Need help with your purchase? Ask me anything about this item, logistics, or the buying process.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., How do I arrange delivery?"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="flex-shrink-0" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}
        
        {assistance && (
          <div className="pt-4 space-y-4">
            <div className="p-4 bg-background rounded-lg space-y-2">
                <p className="font-semibold">Assistant:</p>
                <p className="text-muted-foreground">{assistance.response}</p>
            </div>
            
            {assistance.steps.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-semibold">Suggested Next Steps:</p>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                Select an action...
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                            {assistance.steps.map((step, index) => (
                                <DropdownMenuItem key={index}>
                                    {step}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
