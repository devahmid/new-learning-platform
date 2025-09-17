export interface CreateMessage {
  senderId: number;
  receiverId: number;
  content: string;
  imageUrl?: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  editedAt?: string;
  imageUrl?: string;
  read: boolean;
  timestamp: string;
  deletedBySender: boolean;
  deletedByReceiver: boolean;
}
