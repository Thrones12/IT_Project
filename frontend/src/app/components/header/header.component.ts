import { Component, OnInit } from '@angular/core';
import {CartModelServer} from "../../models/cart.model";
import {CartService} from "../../services/cart.service";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  cartData!: CartModelServer;
  cartTotal!: number;
  authState!: boolean;

  constructor(public cartService: CartService,
              private userService: UserService) {}

  ngOnInit() {
    this.cartService.cartTotal$.subscribe(total => {
      this.cartTotal = total;
    });

    this.cartService.cartData$.subscribe(data => this.cartData = data);

    this.userService.authState$.subscribe(authState => this.authState = authState);
  }

}
