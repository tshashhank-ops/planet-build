// This is an AI-powered tool that suggests reclaimed material options.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestReclaimedMaterialsInputSchema = z.object({
  newMaterialDescription: z.string().describe('Description of the new material the buyer is searching for.'),
});
export type SuggestReclaimedMaterialsInput = z.infer<typeof SuggestReclaimedMaterialsInputSchema>;

const SuggestReclaimedMaterialsOutputSchema = z.object({
  suggestedReclaimedMaterials: z.array(
    z.string().describe('A reclaimed material option comparable to the new material.')
  ).describe('List of suggested reclaimed materials.')
});
export type SuggestReclaimedMaterialsOutput = z.infer<typeof SuggestReclaimedMaterialsOutputSchema>;

export async function suggestReclaimedMaterials(input: SuggestReclaimedMaterialsInput): Promise<SuggestReclaimedMaterialsOutput> {
  return suggestReclaimedMaterialsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestReclaimedMaterialsPrompt',
  input: {schema: SuggestReclaimedMaterialsInputSchema},
  output: {schema: SuggestReclaimedMaterialsOutputSchema},
  prompt: `You are an AI assistant that suggests reclaimed material options based on the new material a buyer is searching for.

  Suggest reclaimed materials that are functionally equivalent or can be used as substitutes for the new material.

  New Material Description: {{{newMaterialDescription}}}

  Respond with a list of reclaimed material options.
  `,
});

const suggestReclaimedMaterialsFlow = ai.defineFlow(
  {
    name: 'suggestReclaimedMaterialsFlow',
    inputSchema: SuggestReclaimedMaterialsInputSchema,
    outputSchema: SuggestReclaimedMaterialsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
