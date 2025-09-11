
export type Bid = {
  userId: number;
  amount: number;
  timestamp: string;
};

export type Material = {
  id: number;
  name: string;
  price: number;
  description: string;
  condition: 'New' | 'Reclaimed';
  images: string[];
  sellerId: number;
  category: string;
  location: string;
  quantity: string;
  specs: Record<string, string>;
  incoterms?: string;
  hsCode?: string;
  weight?: string;
  dimensions?: string;
  specialHandling?: boolean;
  dataAiHint?: string;
  enableBidding?: boolean;
  auctionEndDate?: string;
  startingBid?: number;
  bidHistory?: Bid[];
};

export type Review = {
  id: number;
  authorId: number;
  rating: number;
  comment: string;
  date: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  rating: number;
  memberSince: string;
  reviews: Review[];
  badges: string[];
  carbonCredits: number;
  dataAiHint?: string;
};

export type Message = {
    id: number;
    senderId: number;
    text: string;
    timestamp: string;
}

export type Conversation = {
    id: number;
    participant: User;
    lastMessage: Message;
    unreadCount: number;
}

export type TradeLeadBid = {
  userId: number;
  pricePerUnit: number;
  timestamp: string;
  volume?: number;
};

export type TradeLead = {
  id: number;
  type: 'buy' | 'sell';
  contractType?: 'volume' | 'fixed';
  userId: number;
  materialName: string;
  category: string;
  description: string;
  volume: number;
  unit: string;
  pricePerUnit?: number;
  location: string;
  deliveryAfter: string;
  deliveryBefore: string;
  timestamp: string;
  biddingEndDate: string;
  bids: TradeLeadBid[];
};
