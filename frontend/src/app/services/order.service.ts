import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  placeOrder(order: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/`, order).pipe(timeout(30000));
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/`).pipe(timeout(30000));
  }

  getOrderCount(): Observable<{ total: number; pending: number }> {
    return this.http.get<{ total: number; pending: number }>(`${this.apiUrl}/orders/count`).pipe(timeout(10000));
  }

  updateOrderStatus(id: string, status: Order['status'], trackingId?: string): Observable<Order> {
    const body: any = { status };
    if (trackingId) body.trackingId = trackingId;
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}`, body).pipe(timeout(15000));
  }
}
