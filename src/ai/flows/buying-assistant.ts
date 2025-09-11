'use server';
/**
 * @fileOverview Provides a buying assistant to help users purchase materials.
 *
 * - buyingAssistant - A function that provides guidance for purchasing an item.
 * - BuyingAssistantInput - The input type for the buyingAssistant function.
 * - BuyingAssistantOutput - The return type for the buyingAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BuyingAssistantInputSchema = z.object({
  materialName: z.string().describe('The name of the material being purchased.'),
  materialDescription: z.string().describe('The description of the material.'),
  sellerName: z.string().describe('The name of the seller.'),
  userQuery: z.string().describe("The user's question or request about buying the item."),
});
export type BuyingAssistantInput = z.infer<typeof BuyingAssistantInputSchema>;

const BuyingAssistantOutputSchema = z.object({
  assistantResponse: z
    .string()
    .describe('A helpful, conversational response to guide the user in their purchase.'),
    suggestedNextSteps: z.array(z.string()).describe('A list of suggested next steps for the user to take.'),
});
export type BuyingAssistantOutput = z.infer<typeof BuyingAssistantOutputSchema>;

export async function buyingAssistant(
  input: BuyingAssistantInput
): Promise<BuyingAssistantOutput> {
  return buyingAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'buyingAssistantPrompt',
  input: {schema: BuyingAssistantInputSchema},
  output: {schema: BuyingAssistantOutputSchema},
  prompt: `You are a sophisticated AI buying assistant for PlanetBuild, a marketplace for new and reclaimed building materials. Your goal is to create a great, fast, and sophisticated buying experience for the user.

You are assisting a user who is interested in a specific material.

Material Details:
- Name: {{{materialName}}}
- Description: {{{materialDescription}}}
- Seller: {{{sellerName}}}

The user's query is: "{{{userQuery}}}"

Your tasks are:
1.  Provide a clear, concise, and helpful response to the user's query. Be encouraging and proactive.
2.  Suggest concrete next steps the user can take to complete their purchase. These steps should correspond to actions available in the app, such as messaging the seller, getting a delivery quote, or buying now.

Example Next Steps:
- "Message the seller, {{{sellerName}}}, with your questions."
- "Request a delivery quote for the '{{{materialName}}}'."
- "Proceed to checkout to buy the '{{{materialName}}}'."
- "Ask about the material's condition."

Based on the user's query, generate a helpful response and a list of the most relevant next steps.
  `,
});

const buyingAssistantFlow = ai.defineFlow(
  {
    name: 'buyingAssistantFlow',
    inputSchema: BuyingAssistantInputSchema,
    outputSchema: BuyingAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
