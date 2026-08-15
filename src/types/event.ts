export interface CreateEventData {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  externalId: string;
  category: string;
  date: Date;
  location: string;
  capacity: number;
  price: number;
  organizerId: string;
}

export interface CreateEventInput {
  externalId: string;
  date: string;
  location: string;
  capacity: number;
  price: number;
}