import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  product: ProductResponseModel[] = [];
  private Server_Url = 'http://localhost:3000/api'

  constructor(private http: HttpClient) { }


  getSingleOrder(orderId: number){
    return this.http.get<ProductResponseModel[]>(this.Server_Url+ '/orders/' + orderId).toPromise();
  }
}

interface ProductResponseModel{
  id: number;
  title: string;
  description: string;
  price: number;
  quantityOredered: number;
  image: string;

}
