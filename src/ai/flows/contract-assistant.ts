'use server';
/**
 * @fileOverview Provides an AI assistant for futures contracts.
 *
 * - contractAssistant - A function that provides guidance for a contract.
 * - ContractAssistantInput - The input type for the contractAssistant function.
 * - ContractAssistantOutput - The return type for the contractAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContractAssistantInputSchema = z.object({
  leadType: z.enum(['buy', 'sell']).describe("The type of contract lead, either 'buy' (demand) or 'sell' (supply)."),
  materialName: z.string().describe('The name of the material in the contract.'),
  posterName: z.string().describe('The name of the user who posted the contract.'),
  userQuery: z.string().describe("The user's question or request about the contract."),
});
export type ContractAssistantInput = z.infer<typeof ContractAssistantInputSchema>;

const ContractAssistantOutputSchema = z.object({
  assistantResponse: z
    .string()
    .describe('A helpful, conversational response to guide the user regarding the contract.'),
  suggestedNextSteps: z.array(z.string()).describe('A list of suggested next steps for the user to take.'),
});
export type ContractAssistantOutput = z.infer<typeof ContractAssistantOutputSchema>;

export async function contractAssistant(
  input: ContractAssistantInput
): Promise<ContractAssistantOutput> {
  return contractAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contractAssistantPrompt',
  input: {schema: ContractAssistantInputSchema},
  output: {schema: ContractAssistantOutputSchema},
  prompt: `You are a sophisticated AI trading assistant for PlanetBuild, a marketplace for new and reclaimed building materials. Your goal is to help users navigate and commit to futures contracts.

You are assisting a user who is viewing a contract.

Contract Details:
- Type: This is a "{{{leadType}}}" contract (meaning the poster wants to {{{leadType}}}).
- Material: {{{materialName}}}
- Posted By: {{{posterName}}}

The user's query is: "{{{userQuery}}}"

Your tasks are:
1.  Provide a clear, concise, and helpful response to the user's query from the perspective of a trading expert. Be encouraging and proactive.
2.  Suggest concrete next steps the user can take. These steps should correspond to actions available in the app.

Example Next Steps:
- "Place a competitive bid on this contract."
- "Commit to this contract now at the listed price."
- "Message {{{posterName}}} to clarify delivery logistics."
- "Ask about quality specifications for '{{{materialName}}}'."

Based on the user's query, generate a helpful response and a list of the most relevant next steps.
  `,
});

const contractAssistantFlow = ai.defineFlow(
  {
    name: 'contractAssistantFlow',
    inputSchema: ContractAssistantInputSchema,
    outputSchema: ContractAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
