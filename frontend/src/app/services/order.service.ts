import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8001/api';

  placeOrder(order: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  getOrderCount(): Observable<{ total: number; pending: number }> {
    return this.http.get<{ total: number; pending: number }>(`${this.apiUrl}/orders/count`);
  }

  updateOrderStatus(id: string, status: Order['status'], trackingId?: string): Observable<Order> {
    const body: any = { status };
    if (trackingId) body.trackingId = trackingId;
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}`, body);
  }
}
