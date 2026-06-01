export interface Order {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod';
  notes?: string;
  trackingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Review {
  id: string;
  productId: string;
  orderId: string;
  buyerName: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}
