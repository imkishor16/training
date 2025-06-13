import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductModel } from '../Model/Product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<any> {
    return this.http.get('https://dummyjson.com/products');
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`https://dummyjson.com/products/${id}`);
  }
}
