import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Products } from './products';
import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { ProductModel } from '../models/product';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

class MockProductService {
  getProducts() {
    return { subscribe: () => {} };
  }
}

@Component({
  standalone: true,
  imports: [Products],
  template: `<app-products [productList]="products"></app-products>`
})
class HostComponent {
  products: ProductModel[] = [];
}

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<HostComponent>;
  let hostComponent: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: ProductService, useClass: MockProductService },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const productsFixture = TestBed.createComponent(Products);
    component = productsFixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render product list when provided', () => {
    hostComponent.products = [
      { id: 1, title: 'Product 1', price: 100, description: 'Description 1' } as ProductModel,
      { id: 2, title: 'Product 2', price: 200, description: 'Description 2' } as ProductModel
    ];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Product 1');
    expect(compiled.textContent).toContain('Product 2');
  });

  it('should handle empty product list', () => {
    hostComponent.products = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.no-products-message')).toBeTruthy();
  });
});
