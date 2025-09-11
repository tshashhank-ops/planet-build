'use server';

import { suggestReclaimedMaterials, SuggestReclaimedMaterialsInput, SuggestReclaimedMaterialsOutput } from '@/ai/flows/suggest-reclaimed-materials';
import { suggestReclaimedMaterialsSeller, SuggestReclaimedMaterialsSellerInput, SuggestReclaimedMaterialsSellerOutput } from '@/ai/flows/suggest-reclaimed-materials-seller';
import { buyingAssistant, BuyingAssistantInput, BuyingAssistantOutput } from '@/ai/flows/buying-assistant';
import { draftMessage, DraftMessageInput, DraftMessageOutput } from '@/ai/flows/draft-message';
import { matchTradeLeads, MatchLeadsInput, MatchLeadsOutput } from '@/ai/flows/match-trade-leads';
import { tradeLeads } from '@/lib/mock-data';
import { contractAssistant, ContractAssistantInput, ContractAssistantOutput } from '@/ai/flows/contract-assistant';

export async function getBuyerSuggestions(input: SuggestReclaimedMaterialsInput): Promise<SuggestReclaimedMaterialsOutput> {
  try {
    return await suggestReclaimedMaterials(input);
  } catch (error) {
    console.error('Error getting buyer suggestions:', error);
    return { suggestedReclaimedMaterials: [] };
  }
}

export async function getSellerSuggestions(input: SuggestReclaimedMaterialsSellerInput): Promise<SuggestReclaimedMaterialsSellerOutput> {
    try {
        return await suggestReclaimedMaterialsSeller(input);
    } catch (error) {
        console.error('Error getting seller suggestions:', error);
        return { suggestedReclaimedMaterials: [] };
    }
}

export async function getBuyingAssistance(input: BuyingAssistantInput): Promise<BuyingAssistantOutput> {
    try {
        return await buyingAssistant(input);
    } catch (error) {
        console.error('Error getting buying assistance:', error);
        return { assistantResponse: 'Sorry, I was unable to process your request at the moment.', suggestedNextSteps: [] };
    }
}

export async function getDraftMessage(input: DraftMessageInput): Promise<DraftMessageOutput> {
    try {
        return await draftMessage(input);
    } catch (error) {
        console.error('Error getting message draft:', error);
        return { messageDraft: '' };
    }
}

export async function getTradeLeadMatches(newLead: MatchLeadsInput['newLead']): Promise<MatchLeadsOutput> {
    try {
        // In a real app, you would fetch this from your database.
        const existingLeads = tradeLeads; 
        
        return await matchTradeLeads({ newLead, existingLeads });
    } catch (error) {
        console.error('Error getting trade lead matches:', error);
        return { matchedLeadIds: [] };
    }
}

export async function getContractAssistance(input: ContractAssistantInput): Promise<ContractAssistantOutput> {
    try {
        return await contractAssistant(input);
    } catch (error) {
        console.error('Error getting contract assistance:', error);
        return { assistantResponse: 'Sorry, I was unable to process your request at the moment.', suggestedNextSteps: [] };
    }
}
