import SellFormWrapper from './SellFormWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf } from 'lucide-react';

export default function SellPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6" />
            </div>
          <CardTitle className="text-3xl font-bold font-headline">List Your Material</CardTitle>
          <CardDescription>
            Turn your surplus into cash and contribute to a circular economy. Fill out the details below to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SellFormWrapper />
        </CardContent>
      </Card>
    </div>
  );
}
