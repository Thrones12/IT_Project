import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ProductService} from "./product.service";
import {OrderService} from "./order.service";
import {CartModelPublic, CartModelServer} from "../models/cart.model";
import {BehaviorSubject} from "rxjs";
import {NavigationExtras, Router} from "@angular/router";
import {ProductModelServer} from "../models/product.model";
import {ToastrService} from "ngx-toastr";
import {NgxSpinnerService} from "ngx-spinner";


@Injectable({
  providedIn: 'root'
})
export class CartService {
  private serverURL = 'http://localhost:3000/api'

  // Dữ liệu của biến sẽ lưu thông tin của cart vào client's local storage

  private cartDataClient: CartModelPublic={
    total: 0,
    prodData: [{
      incart: 0,
      id: 0
    }]
  };


  // Dữ liệu của biến sẽ lưu thông tin của cart vào Server
  private cartDataServer: CartModelServer = {
    total: 0,
    data: [{
      numInCart: 0,
      product: undefined!
    }]
  };

  // Lưu thông tin cart vào local storage của ng dùng để tránh mất thông tin khi refresh
  cartTotal$ = new BehaviorSubject<number>(0);
  cartData$ = new BehaviorSubject<CartModelServer>(this.cartDataServer);

  constructor(private http: HttpClient,
              private productService: ProductService,
              private orderService: OrderService,
              private router: Router,
              private toast: ToastrService,
              private spinner: NgxSpinnerService) {

    this.cartTotal$.next(this.cartDataServer.total);
    this.cartData$.next(this.cartDataServer);

    //Lấy thông tin từ local storage êńu có́

    let info: CartModelPublic | null = null;
    if (typeof localStorage !== 'undefined') {
      info = JSON.parse(localStorage.getItem('cart')!);
    }


    //   check xem var null hay có gtri
    if(info !== null && info !== undefined && info.prodData[0].incart !== 0){
      // local storage khong empty
      this.cartDataClient = info;
      //Loop đ entry vào cartDataServer obj
      this.cartDataClient.prodData.forEach(p => {
        this.productService.getSingleProduct(p.id).subscribe((actualProductInfo: ProductModelServer)=>{
          if(this.cartDataServer.data[0].numInCart === 0){
            this.cartDataServer.data[0].numInCart = p.incart;
            this.cartDataServer.data[0].product = actualProductInfo;
          //   Tinh tong
            this.CalculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          } else{
          //   CartDataServer co' data be4
            this.cartDataServer.data.push({
              numInCart: p.incart,
              product: actualProductInfo
            });
            this.CalculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
          this.cartData$.next({... this.cartDataServer});
        })
      })
    }
  }
  // @ts-ignore
  CalculateSubTotal(index): number {
    let subTotal = 0;

    let p = this.cartDataServer.data[index];
    // @ts-ignore
    subTotal = p.product.price * p.numInCart;

    return subTotal;
  }
  AddProductToCart(id: number, quantity ?: number){
    this.productService.getSingleProduct(id).subscribe(prod => {
      //1. trường hợp cart  rỗng
      if(this.cartDataServer.data[0].product === undefined){
        this.cartDataServer.data[0].product = prod;
        this.cartDataServer.data[0].numInCart = quantity !== undefined ? quantity : 1;
      //   subtotal
        this.CalculateTotal();
        this.cartDataClient.prodData[0].incart = this.cartDataServer.data[0].numInCart;
        this.cartDataClient.prodData[0].id = prod.id;
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartData$.next({... this.cartDataServer});
      //   pop up
        this.toast.success(`Thêm sản phẩm ${prod.name} vào giỏ hàng thành công`,'Product Added',{
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-bottom-right'
        });
      }
      //2.  cart có item
      else{
        const index = this.cartDataServer.data.findIndex(p => p.product.id === prod.id);
        //a.  item tồn tại trong  cart

        if(index !== -1) {
          if (quantity !== undefined && quantity <= prod.quantity){
            this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.quantity ? quantity : prod.quantity;
          }

          else{
            console.log("Tang so luong san pham")
            this.cartDataServer.data[index].numInCart < prod.quantity ? this.cartDataServer.data[index].numInCart++ : prod.quantity;
          }
          this.cartDataClient.prodData[index].incart = this.cartDataServer.data[index].numInCart;
          this.CalculateTotal();
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          // pop up
          this.toast.info(`Tăng số lượng sản phẩm ${prod.name} vào giỏ hàng thành công`,'Quantity Updated',{
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-bottom-right'
          });




        } else{
          //b. item không tồn tại trong cart
          this.cartDataServer.data.push({
            numInCart: 1,
            product: prod
          });


          this.cartDataClient.prodData.push({
            incart: 1,
            id: prod.id
          });
        //   popup popup

          this.toast.success(`Thêm sản phẩm ${prod.name} vào giỏ hàng thành công`,'Product Added',{
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-bottom-right'
          });

          //tinh tien
          this.CalculateTotal();
          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          this.cartData$.next({... this.cartDataServer});
        }
      }
    });
  }
  UpdateCartItems(index: number, increase: boolean){
    let data = this.cartDataServer.data[index];

    if(increase){
      data.numInCart < data.product.quantity ? data.numInCart++ : data.product.quantity;
      this.cartDataClient.prodData[index].incart = data.numInCart;
    //   cal total amount
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      this.cartData$.next({... this.cartDataServer});
    } else{
      data.numInCart--;
    }
    if(data.numInCart < 1){
      //xoa san pham tu cart
      this.cartData$.next({... this.cartDataServer});
    }else{
      this.cartData$.next({... this.cartDataServer});
      this.cartDataClient.prodData[index].incart = data.numInCart;
      // total amount
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
    }
  }
  DeleteProductFromCart(index: number){
    if(window.confirm('Bạn có chắc muốn xoá sản phẩm?')){
      this.cartDataServer.data.splice(index, 1);
      this.cartDataClient.prodData.splice(index, 1);
      //cal total amount
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;
      if(this.cartDataClient.total === 0){
        this.cartDataClient = {total: 0,
        prodData: [{
          incart: 0,
          id: 0
        }]};
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      } else {
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }

      if (this.cartDataServer.total === 0 ){
        this.cartDataServer = {total: 0,
        data: [{
          numInCart: 0,
          product: undefined!
        }]};
        this.cartData$.next({... this.cartDataServer});
      } else{
        this.cartData$.next({... this.cartDataServer});
      }
    } else{
      //Neu nguoi dung click nut cancel
      return;
    }
  }

  CheckoutFromCart(userId:number){
    this.http.post<{success: boolean}>(`${this.serverURL}/orders/payment`,null).subscribe((res:{success: boolean}  )=>{
      if(res.success){
        this.resetServerData();
        this.http.post<any>(`${this.serverURL}/orders/new`,{
          userId: userId,
          products: this.cartDataClient.prodData
        }).subscribe((data: OrderResponse)=>{

          this.orderService.getSingleOrder(data.order_id).then(prods => {
            if(data.success){
              const navigationExtras: NavigationExtras = {
                state:{
                  message: data.message,
                  products:prods,
                  orderId: data.order_id,
                  total: this.cartDataClient.total
                }
              };

              // hide spinner

              this.spinner.hide().then();

              this.router.navigate(['/thankyou'],navigationExtras).then(p => {
                this.cartDataClient = { total: 0, prodData: [{incart:0, id:0}] };
                this.cartTotal$.next(0);
                localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
              })
            }
          });
        });
      }else{
        this.spinner.hide().then();
        this.router.navigateByUrl('/checkout').then();
        this.toast.error(`Có lỗi xảy ra trong quá trình thanh toán`,'Sorry',{
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-bottom-right'
        });
      }
    });
  }

  private CalculateTotal(){
    let Total = 0;
    this.cartDataServer.data.forEach(p => {
      const {numInCart}  = p;
      const {price}  = p.product;

      Total += numInCart * price;
    });
    this.cartDataServer.total = Total;
    this.cartTotal$.next(this.cartDataServer.total);
  }


//   thanh toan

  private resetServerData(){
    this.cartDataServer = {total: 0,
    data: [{
      numInCart: 0,
      product: undefined!
    }]};
    this.cartData$.next({... this.cartDataServer});
  }

}


interface OrderResponse{
  order_id: number;
  success : boolean;
  message: string;
  products: [{
    id: number;
    numInCart: string;
  }]
}
