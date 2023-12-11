  import {Component, Input, OnInit} from '@angular/core';
  import {CartService} from "../../../services/cart.service";
  import {OrderService} from "../../../services/order.service";
  import {Router} from "@angular/router";
  import {NgxSpinnerService} from "ngx-spinner";
  import {CartModelServer} from "../../../models/cart.model";
  import { ToastrService } from 'ngx-toastr';


  declare var paypal: any;
@Component({
  selector: 'paypal-button',
  templateUrl: './paypal-button.component.html',
  styleUrl: './paypal-button.component.scss'
})
export class PaypalButtonComponent implements OnInit {
  @Input()
  cartTotal!: number;
  cartData!: CartModelServer;
  constructor(private cartService: CartService,
              private orderService: OrderService,
              private router: Router,
              private spinner: NgxSpinnerService,
              private toastrService: ToastrService) {}
  ngOnInit(): void {
    this.cartService.cartData$.subscribe(data => this.cartData = data);
    this.cartService.cartTotal$.subscribe(total => this.cartTotal = total);


    // const self = this;
    // paypal
    //   .Buttons({
    //     createOrder: (data: any, actions: any) => {
    //       return actions.order.create({
    //         purchase_units: [
    //           {
    //             amount: {
    //               currency_code: 'USD',
    //               value: cartTotal,
    //             },
    //           },
    //         ],
    //       });
    //     },
    //
    //     onApprove: async (data: any, actions: any) => {
    //       const payment = await actions.order.capture();
    //       this.order.paymentId = orderId;
    //       self.orderService.pay(this.order).subscribe(
    //         {
    //           next: (orderId) => {
    //             this.cartService.clearCart();
    //             this.router.navigateByUrl('/track/' + orderId);
    //             this.toastrService.success(
    //               'Payment Saved Successfully',
    //               'Success'
    //             );
    //           },
    //           error: (error) => {
    //             this.toastrService.error('Payment Save Failed', 'Error');
    //           }
    //         }
    //       );
    //     },
    //
    //     onError: (err: any) => {
    //       this.toastrService.error('Payment Failed', 'Error');
    //       console.log(err);
    //     },
    //   })
    //   .render(this.paypalElement.nativeElement);
  }
}
