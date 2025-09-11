import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-reclaimed-materials.ts';
import '@/ai/flows/suggest-reclaimed-materials-seller.ts';
import '@/ai/flows/buying-assistant.ts';
import '@/ai/flows/draft-message.ts';
import '@/ai/flows/match-trade-leads.ts';
import '@/ai/flows/contract-assistant.ts';
