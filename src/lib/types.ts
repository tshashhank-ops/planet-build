import type { NextApiRequest } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket } from "net";
import type { Server as IOServer } from "socket.io";


export type Bid = {
  userId: string; // MongoDB ObjectId as string
  amount: number;
  timestamp: string;
};

export type Post = {
  _id: string; // MongoDB ObjectId as string
  title: string;
  price: number;
  description: string;
  condition: 'new' | 'reclaimed'; // match schema
  photos: string[];
  owner?: string; // userId or organisationId as string
  category: string;
  location: string;
  quantity: number;
  specs?: Record<string, string>;
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
  createdAt: string;
};

export type Review = {
  _id: string;
  authorId: string;
  rating: number;
  comment: string;
  date: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'staff';
  organisation?: string; // org id
  rating?: number;
  memberSince?: string;
  reviews?: Review[];
  badges: string[];
  carbonCredits: number;
  dataAiHint?: string;
  createdAt: string;
};

export type UserInConversation = {
  userId: string;
  isActive: boolean;
  joinedAt: string; 
};

export type Conversation = {
  _id: string;
  isActive: boolean;
  users: UserInConversation[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  unreadCount: number;
};

export type Message = {
  _id: string;
  conversationId: string;
  sentUserId: string;
  text?: string;
  media?: string;
  isEdited: boolean;
  isDeleted: boolean;
  deliveredTo: string[]; // array of user IDs
  readBy: string[]; // array of user IDs
  reaction: Record<string, number>; // e.g., { like: 2, love: 1 }
  messageReplyTo?: string; // optional reference to another message
  createdAt: string;
  updatedAt: string;
};

export type TradeLeadBid = {
  userId: string;
  pricePerUnit: number;
  timestamp: string;
  volume?: number;
};

export type TradeLead = {
  id: number;
  type: 'buy' | 'sell';
  contractType?: 'volume' | 'fixed';
  userId: string;
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

export interface SocketServer extends HTTPServer {
  io?: IOServer;
}

export interface SocketWithIO extends Socket {
  server: SocketServer;
}

export interface NextApiRequestWithSocket extends NextApiRequest {
  socket: SocketWithIO;
}

export type Organisation = {
  _id: string;
  name: string;
  members: User[];
  createdAt: string;
  updatedAt: string;
};
