import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CartItem {
  name: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent {
  public cartItems: CartItem[] = [];
  showCart = false;

  addToCart(item: CartItem) {
    this.cartItems.push(item);
  }

  getCartItems() {
    return this.cartItems;
  }

  getCartCount() {
    return this.cartItems.length;
  }

  toggleCart() {
    this.showCart = !this.showCart;
  }
}
