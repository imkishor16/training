import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../Services/product.service';
import { Product } from '../../Models/product.model';
import { ProductModel } from '../../Model/Product';
import { Product } from "../product/product";
import { CartItem } from '../../Model/CartItem';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  categories: string[] = [];
  cartItems: CartItem[] = [];
  cartCount: number = 0;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  handleAddToCart(event: Number) {
    console.log("Handling add to cart - " + event);
    let flag = false;
    for (let i = 0; i < this.cartItems.length; i++) {
      if (this.cartItems[i].Id == event) {
        this.cartItems[i].Count++;
        flag = true;
      }
    }
    if (!flag)
      this.cartItems.push(new CartItem(event, 1));
    this.cartCount++;
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products = data;
        this.categories = [...new Set(data.map((p: Product) => p.category))];
      },
      error: (error: Error) => console.error('Error loading products:', error)
    });
  }

  get filteredProducts(): Product[] {
    return this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  viewProduct(id: number) {
    this.router.navigate(['/product', id]);
  }
} 