'use client';

import { useEffect, useState } from 'react';
import { getBuyerSuggestions } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';

interface AiSuggestionsProps {
  query: string;
}

export default function AiSuggestions({ query }: AiSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getBuyerSuggestions({
          newMaterialDescription: query,
        });
        setSuggestions(result.suggestedReclaimedMaterials);
      } catch (e) {
        setError('Could not fetch AI suggestions.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [query]);

  if (!query || (suggestions.length === 0 && !isLoading)) return null;

  return (
    <Card className="bg-secondary border-primary/20">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Lightbulb className="h-6 w-6 text-primary" />
        <CardTitle className="text-primary font-headline">AI-Powered Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Finding reclaimed alternatives for &quot;{query}&quot;...</span>
          </div>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <div>
            <p className="text-sm text-foreground mb-3">
              Searching for &quot;{query}&quot;? Consider these sustainable reclaimed alternatives:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button key={index} variant="outline" size="sm">
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
