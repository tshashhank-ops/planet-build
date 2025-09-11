'use server';
/**
 * @fileOverview Suggests reclaimed materials comparable to the new materials a seller is listing.
 *
 * - suggestReclaimedMaterialsSeller - A function that suggests reclaimed materials.
 * - SuggestReclaimedMaterialsSellerInput - The input type for the suggestReclaimedMaterialsSeller function.
 * - SuggestReclaimedMaterialsSellerOutput - The return type for the suggestReclaimedMaterialsSeller function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestReclaimedMaterialsSellerInputSchema = z.object({
  newMaterialDescription: z
    .string()
    .describe('The description of the new material being listed by the seller.'),
});
export type SuggestReclaimedMaterialsSellerInput = z.infer<
  typeof SuggestReclaimedMaterialsSellerInputSchema
>;

const SuggestReclaimedMaterialsSellerOutputSchema = z.object({
  suggestedReclaimedMaterials: z
    .array(z.string())
    .describe(
      'A list of suggested reclaimed materials that are comparable to the new material.'
    ),
});
export type SuggestReclaimedMaterialsSellerOutput = z.infer<
  typeof SuggestReclaimedMaterialsSellerOutputSchema
>;

export async function suggestReclaimedMaterialsSeller(
  input: SuggestReclaimedMaterialsSellerInput
): Promise<SuggestReclaimedMaterialsSellerOutput> {
  return suggestReclaimedMaterialsSellerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestReclaimedMaterialsSellerPrompt',
  input: {schema: SuggestReclaimedMaterialsSellerInputSchema},
  output: {schema: SuggestReclaimedMaterialsSellerOutputSchema},
  prompt: `You are an AI assistant that helps construction material sellers suggest reclaimed materials to buyers.

  Given the description of the new material the seller is listing, suggest a list of reclaimed materials that are comparable.
  New Material Description: {{{newMaterialDescription}}}

  Return a list of suggested reclaimed materials. Focus on materials that could be used as substitutes or alternatives to the new material.
  `,
});

const suggestReclaimedMaterialsSellerFlow = ai.defineFlow(
  {
    name: 'suggestReclaimedMaterialsSellerFlow',
    inputSchema: SuggestReclaimedMaterialsSellerInputSchema,
    outputSchema: SuggestReclaimedMaterialsSellerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
