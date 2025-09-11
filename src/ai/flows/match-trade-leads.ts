
'use server';
/**
 * @fileOverview An AI flow to match new trade leads with existing ones.
 *
 * - matchTradeLeads - A function that finds compatible trade leads.
 * - MatchLeadsInput - The input type for the matchTradeLeads function.
 * - MatchLeadsOutput - The return type for the matchTradeLeads function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { TradeLead } from '@/lib/types';

// We define the Zod schema for a TradeLead here to use in the flow.
// It's important that this matches the `TradeLead` type in `src/lib/types.ts`.
const TradeLeadBidSchema = z.object({
  userId: z.number(),
  pricePerUnit: z.number(),
  timestamp: z.string().datetime(),
  volume: z.number().optional(),
});

const TradeLeadSchema = z.object({
  id: z.number(),
  type: z.enum(['buy', 'sell']),
  userId: z.number(),
  materialName: z.string(),
  category: z.string(),
  description: z.string(),
  volume: z.number(),
  unit: z.string(),
  pricePerUnit: z.number().optional(),
  location: z.string(),
  deliveryAfter: z.string().datetime(),
  deliveryBefore: z.string().datetime(),
  timestamp: z.string().datetime(),
  biddingEndDate: z.string().datetime(),
  bids: z.array(TradeLeadBidSchema),
  contractType: z.enum(['volume', 'fixed']).optional(),
});


const MatchLeadsInputSchema = z.object({
  newLead: TradeLeadSchema.omit({id: true, userId: true, timestamp: true, bids: true }),
  existingLeads: z.array(TradeLeadSchema),
});
export type MatchLeadsInput = z.infer<typeof MatchLeadsInputSchema>;

const MatchLeadsOutputSchema = z.object({
  matchedLeadIds: z
    .array(z.number())
    .describe('An array of IDs of the best matching trade leads.'),
});
export type MatchLeadsOutput = z.infer<typeof MatchLeadsOutputSchema>;

export async function matchTradeLeads(input: MatchLeadsInput): Promise<MatchLeadsOutput> {
  return matchLeadsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchLeadsPrompt',
  input: { schema: MatchLeadsInputSchema },
  output: { schema: MatchLeadsOutputSchema },
  prompt: `You are an AI matching engine for a materials trading platform. Your task is to find the best matches for a new trade lead from a list of existing leads.

IMPORTANT: You must match 'buy' leads with 'sell' leads, and 'sell' leads with 'buy' leads. Do not match buy-with-buy or sell-with-sell.

The new lead is:
- Type: {{{newLead.type}}}
- Material: {{{newLead.materialName}}}
- Category: {{{newLead.category}}}
- Description: {{{newLead.description}}}
- Volume: {{{newLead.volume}}} {{{newLead.unit}}}
- Location: {{{newLead.location}}}
- Delivery Window: {{{newLead.deliveryAfter}}} to {{{newLead.deliveryBefore}}}

Here is the list of existing trade leads to match against:
{{#each existingLeads}}
---
Lead ID: {{id}}
Type: {{type}}
Material: {{materialName}}
Category: {{category}}
Description: {{description}}
Volume: {{volume}} {{unit}}
Location: {{location}}
Delivery Window: {{deliveryAfter}} to {{deliveryBefore}}
{{/each}}

Consider the following matching criteria, in order of importance:
1. Opposite Type: A 'buy' lead must be matched with a 'sell' lead.
2. Category and Material: The materials should be in the same category and be functionally similar or identical (e.g., 'steel beams' can match 'structural steel').
3. Volume: The volumes should be reasonably close. A perfect match is not required, but they should be in a similar ballpark.
4. Location: Closer geographic locations are better matches.
5. Delivery Window: The delivery windows must overlap.

Based on these criteria, return the IDs of the top 3-5 best matching leads from the existing list. If there are no good matches, return an empty array.`,
});

const matchLeadsFlow = ai.defineFlow(
  {
    name: 'matchLeadsFlow',
    inputSchema: MatchLeadsInputSchema,
    outputSchema: MatchLeadsOutputSchema,
  },
  async (input) => {
    // Filter out leads of the same type before sending to the LLM
    const filteredLeads = input.existingLeads.filter(
        lead => lead.type !== input.newLead.type
    );
    
    if (filteredLeads.length === 0) {
        return { matchedLeadIds: [] };
    }

    const { output } = await prompt({ ...input, existingLeads: filteredLeads });
    return output!;
  }
);
