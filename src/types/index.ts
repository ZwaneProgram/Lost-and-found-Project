export interface LostFoundItem {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string;
  location: string;
  contactInfo: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'claimed' | 'resolved';
}

export interface LostFoundItemInput {
  type: 'lost' | 'found';
  title: string;
  description: string;
  location: string;
  contactInfo: string;
  image?: File;
}
