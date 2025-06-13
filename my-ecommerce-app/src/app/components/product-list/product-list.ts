import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent, CartItem } from '../cart/cart';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent {
  @Input() cart!: CartComponent;

  products: Product[] = [
    {
      id: 1,
      name: 'Product 1',
      price: 99.99,
      image: 'https://picsum.photos/200/200?random=1'
    },
    {
      id: 2,
      name: 'Product 2',
      price: 149.99,
      image: 'https://picsum.photos/200/200?random=2'
    },
    {
      id: 3,
      name: 'Product 3',
      price: 199.99,
      image: 'https://picsum.photos/200/200?random=3'
    }
  ];

  addToCart(product: Product) {
    this.cart.addToCart({ name: product.name });
    console.log(`${product.name} has been added to cart`);
  }
}