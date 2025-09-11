import PostLeadForm from './post-lead-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

export default function PostLeadPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6" />
            </div>
          <CardTitle className="text-3xl font-bold font-headline">Post a Contract</CardTitle>
          <CardDescription>
            Let the marketplace know what you need or what you have coming. Our AI will help you find the right trading partner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostLeadForm />
        </CardContent>
      </Card>
    </div>
  );
}
