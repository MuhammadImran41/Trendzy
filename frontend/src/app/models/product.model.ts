export interface Product {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  sellerPrice: number;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  isActive: boolean;
  oriflameUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
