
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { posts, tradeLeads } from '@/lib/mock-data';
import { getTradeLeadMatches } from '@/app/actions';
import { useState, useEffect } from 'react';
import { Loader2, Sparkles, CalendarIcon, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import type { TradeLead } from '@/lib/types';
import TradeLeadCard from '@/components/trade-lead-card';
import { users } from '@/lib/mock-data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';

const formSchema = z.object({
  type: z.enum(['buy', 'sell'], { required_error: 'Please select the lead type.' }),
  materialName: z.string().min(3, 'Material name must be at least 3 characters.'),
  category: z.string({ required_error: 'Please select a category.' }),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  volume: z.coerce.number().positive('Volume must be a positive number.'),
  unit: z.string().min(1, 'Please enter a unit (e.g., tons, lbs, units).'),
  pricePerUnit: z.coerce.number().optional(),
  location: z.string().min(2, 'Please enter a location.'),
  deliveryAfter: z.date({ required_error: 'Please select a start date for delivery.' }),
  deliveryBefore: z.date({ required_error: 'Please select an end date for delivery.' }),
  biddingEndDate: z.date({ required_error: 'Please select a bidding end date.' }),
}).refine(data => data.deliveryBefore > data.deliveryAfter, {
    message: "Delivery end date must be after the start date.",
    path: ['deliveryBefore'],
}).refine(data => data.biddingEndDate > new Date(), {
    message: "Bidding end date must be in the future.",
    path: ['biddingEndDate'],
});


export default function PostLeadForm() {
  const [isMatching, setIsMatching] = useState(false);
  const [matchedLeads, setMatchedLeads] = useState<TradeLead[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'buy',
      materialName: '',
      description: '',
      unit: '',
      location: '',
      biddingEndDate: addDays(new Date(), 14),
    },
  });
  
  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to post a lead. Redirecting...',
        variant: 'destructive',
      });
      router.push('/login');
    }
  }, [user, router, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsMatching(true);
    setMatchedLeads([]);
    try {
        const result = await getTradeLeadMatches({
            ...values,
            deliveryAfter: values.deliveryAfter.toISOString(),
            deliveryBefore: values.deliveryBefore.toISOString(),
            biddingEndDate: values.biddingEndDate.toISOString(),
        });
        
        if (result.matchedLeadIds.length > 0) {
            const matches = tradeLeads.filter(lead => result.matchedLeadIds.includes(lead.id));
            setMatchedLeads(matches);
            toast({
                title: "Potential Matches Found!",
                description: "Our AI has found potential trading partners for your contract. See below for details.",
                className: 'bg-primary text-primary-foreground'
            });
        } else {
             toast({
                title: "Contract Posted!",
                description: "Your contract is live. We'll notify you when we find a match.",
            });
        }

    } catch (error) {
       toast({
        title: 'Error Finding Matches',
        description: 'Could not run the matching service. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setIsMatching(false);
    }
  };

  const categories = [
    ...new Set(posts.map((post) => post.category)),
  ];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary border">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.dataAiHint} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">You are posting as:</p>
            <Link href={`/profile/${user.id}`} className="font-semibold hover:underline">
                {user.name}
            </Link>
          </div>
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>What kind of contract is this?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="buy" /></FormControl>
                    <FormLabel className="font-normal">I want to BUY materials (Demand)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl><RadioGroupItem value="sell" /></FormControl>
                    <FormLabel className="font-normal">I want to SELL materials (Supply)</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />

        <FormField
          control={form.control}
          name="materialName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Recycled PET Pellets" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the material, including any specific requirements, quality standards, or characteristics."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
               <FormDescription>Be as detailed as possible to get the best matches.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a material category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                            {cat}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                        <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Volume</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 10000" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl><Input placeholder="e.g., tons, lbs, units" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="pricePerUnit"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Target / Starting Price / Unit ($)</FormLabel>
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                        <FormControl>
                            <Input type="number" placeholder="15.00" className="pl-7" {...field} />
                        </FormControl>
                     </div>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <FormField
                control={form.control}
                name="deliveryAfter"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Deliver After</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="deliveryBefore"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Deliver Before</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}
                            >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < (form.getValues('deliveryAfter') || new Date())}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="biddingEndDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Bidding End Date</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}
                            >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isMatching}>
                 {isMatching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Post Contract & Find Matches
            </Button>
        </div>
      </form>
    </Form>

    {isMatching && (
        <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Our AI is searching for the best matches for your contract...</p>
        </div>
    )}

    {matchedLeads.length > 0 && (
        <div className="mt-12 space-y-6">
            <Separator />
            <Alert variant="default" className="bg-primary/10 border-primary/20">
                <Lightbulb className="h-4 w-4 text-primary" />
                <AlertTitle className="font-bold text-primary">AI Matching Results</AlertTitle>
                <AlertDescription className="text-primary/90">
                    We found the following contracts that could be a good match for your needs.
                </AlertDescription>
            </Alert>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchedLeads.map(lead => (
                    <TradeLeadCard key={lead.id} lead={lead} user={users.find(u => u.id === lead.userId)} />
                ))}
            </div>
             <div className="text-center pt-4">
                <Button asChild variant="outline">
                    <Link href="/marketplace?tab=contracts">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Back to Contracts
                    </Link>
                </Button>
            </div>
        </div>
    )}
    </>
  );
}

    