import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {Observable} from "rxjs";
import {ProductModelServer, ServerResponse} from "../models/product.model";




@Injectable({
  providedIn: 'root'
})
export class ProductService {
  SERVER_URL = 'http://localhost:3000/api'
  constructor(private http: HttpClient) { }

  showMessage(){
    console.log("Service product da duoc su dung");
  }
  // lấy full sản phẩm
  getAllProducts(numerOfResults=9): Observable<ServerResponse>{
    return this.http.get<ServerResponse>(this.SERVER_URL + '/products',{
      params: {
        limit: numerOfResults.toString()
      }
    });
  }

//   lấy 1 sn phẩm
  getSingleProduct(id: number): Observable<ProductModelServer>{
    return this.http.get<ProductModelServer>(this.SERVER_URL+'/products/'+id);
  }

//lấy sản phầm theo danh mục

  getProductsFromCategory(catName: string) : Observable<ProductModelServer[]>{
    return this.http.get<ProductModelServer[]>(this.SERVER_URL+'/products/category/'+catName);
  }
}

