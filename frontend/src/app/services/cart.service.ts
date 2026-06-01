import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  items = this._items.asReadonly();

  totalItems = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  totalPrice = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.sellerPrice * item.quantity, 0)
  );

  addToCart(product: Product, quantity = 1): void {
    const existing = this._items().find(i => i.product.id === product.id);
    if (existing) {
      this._items.update(items =>
        items.map(i => i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
        )
      );
    } else {
      this._items.update(items => [...items, { product, quantity }]);
    }
  }

  removeFromCart(productId: string): void {
    this._items.update(items => items.filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) { this.removeFromCart(productId); return; }
    this._items.update(items =>
      items.map(i => i.product.id === productId ? { ...i, quantity } : i)
    );
  }

  clearCart(): void {
    this._items.set([]);
  }
}
