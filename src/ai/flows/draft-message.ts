'use server';
/**
 * @fileOverview An AI assistant for drafting messages from buyers to sellers.
 *
 * - draftMessage - A function that generates a message draft.
 * - DraftMessageInput - The input type for the draftMessage function.
 * - DraftMessageOutput - The return type for the draftMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftMessageInputSchema = z.object({
  materialName: z.string().describe('The name of the material the user is interested in.'),
  sellerName: z.string().describe('The name of the seller.'),
  userIntent: z.string().describe('The user\'s goal for the message (e.g., "Ask about availability", "Arrange pickup").'),
});
export type DraftMessageInput = z.infer<typeof DraftMessageInputSchema>;

const DraftMessageOutputSchema = z.object({
  messageDraft: z.string().describe('A polite, well-formatted message draft ready for the user to send.'),
});
export type DraftMessageOutput = z.infer<typeof DraftMessageOutputSchema>;

export async function draftMessage(input: DraftMessageInput): Promise<DraftMessageOutput> {
  return draftMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftMessagePrompt',
  input: {schema: DraftMessageInputSchema},
  output: {schema: DraftMessageOutputSchema},
  prompt: `You are an AI assistant for PlanetBuild, a marketplace for sustainable building materials. Your task is to help a buyer draft a clear, polite, and effective message to a seller.

The user wants to contact a seller named {{{sellerName}}} about an item called "{{{materialName}}}".

The user's intent is: "{{{userIntent}}}"

Based on this, write a concise and friendly message draft. Start the message with a greeting. Do not add a closing like "Sincerely" or the user's name.

Crucially, the message must not include any personal contact information or suggest communicating outside the PlanetBuild platform.

Example for "Ask about availability":
"Hi {{{sellerName}}}, I'm interested in your listing for the '{{{materialName}}}'. Could you please let me know if it's still available? Thank you!"

Example for "Arrange pickup":
"Hi {{{sellerName}}}, I've purchased the '{{{materialName}}}' and would like to arrange a time for pickup. What days and times work best for you?"

Generate a message draft for the user's intent.`,
});

const draftMessageFlow = ai.defineFlow(
  {
    name: 'draftMessageFlow',
    inputSchema: DraftMessageInputSchema,
    outputSchema: DraftMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
