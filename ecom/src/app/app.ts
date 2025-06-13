import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menu } from './Component/menu/menu';
import { Login } from './Component/login/login';
import { ProductsComponent } from './Component/products/products';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Menu, Login, ProductsComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'ecom';
}
