import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Products } from './products';
import { ProductService } from '../services/product.service';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProductModel } from '../models/product';
import { CartItem } from '../models/cartItem';
import { Component } from '@angular/core';

// Stub for <app-product> (a standalone component import)
@Component({
  selector: 'app-product',
  template: ''
})
class MockProductComponent {}

describe('Products Component (Standalone)', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const dummyProductData = {
    products: [
      { id: 1, title: 'Phone' },
      { id: 2, title: 'Laptop' }
    ],
    total: 20
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProductService', ['getProductSearchResult']);

    await TestBed.configureTestingModule({
      imports: [Products, FormsModule], // Include Products component as standalone
      providers: [{ provide: ProductService, useValue: spy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // to ignore <app-product> if not mocked
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    productServiceSpy.getProductSearchResult.and.returnValue(of(dummyProductData));
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should add new item to cart', () => {
    component.handleAddToCart(1);
    expect(component.cartItems.length).toBe(1);
    expect(component.cartItems[0].Id).toBe(1);
    expect(component.cartItems[0].Count).toBe(1);
    expect(component.cartCount).toBe(1);
  });

  it('should increment item count if item already in cart', () => {
    component.cartItems = [new CartItem(1, 1)];
    component.cartCount = 1;
    component.handleAddToCart(1);
    expect(component.cartItems[0].Count).toBe(2);
    expect(component.cartCount).toBe(2);
  });

  it('should debounce and search products', fakeAsync(() => {
    component.searchString = 'mobile';
    component.handleSearchProducts();

    tick(5000); // debounceTime
    fixture.detectChanges();

    expect(productServiceSpy.getProductSearchResult).toHaveBeenCalledWith('mobile', 10, 0);
    expect(component.products.length).toBe(2);
    expect(component.total).toBe(20);
  }));

  it('should trigger loadMore on scroll near bottom', () => {
    spyOn(component, 'loadMore');
    spyOnProperty(window, 'innerHeight').and.returnValue(1000);
    spyOnProperty(window, 'scrollY').and.returnValue(900);
    Object.defineProperty(document.body, 'offsetHeight', { value: 1800 });

    component.products = Array(10).fill({});
    component.total = 20;

    window.dispatchEvent(new Event('scroll'));
    expect(component.loadMore).toHaveBeenCalled();
  });

  it('should load more products and update skip', () => {
    const newProducts = {
      products: [{ id: 3, title: 'Camera' }],
      total: 20
    };
    productServiceSpy.getProductSearchResult.and.returnValue(of(newProducts));

    component.products = [];
    component.searchString = '';
    component.skip = 0;

    component.loadMore();
    expect(productServiceSpy.getProductSearchResult).toHaveBeenCalledWith('', 10, 10);
    expect(component.loading).toBeFalse();
  });
});
