import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, ParamMap} from "@angular/router";
import {ProductService} from "../../services/product.service";
import {ProductModelServer} from "../../models/product.model";
import {map} from "rxjs/operators";
import {CartService} from "../../services/cart.service";

declare let $: any;

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit, AfterViewInit {
  id!: number;

  // @ts-ignore
  product;
  thumbimages: any[] = [];
  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute){}
  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((param: ParamMap)=>{
          // @ts-ignore
          return param.params.id;
        })
      )
      .subscribe(prodId => {
         this.id = prodId;
         this.productService.getSingleProduct(this.id)
         .subscribe(prod => {
             this.product = prod;
           if (prod.images !== null) {
             this.thumbimages = prod.images.split(';');
           }
       });
      });
  }
  ngAfterViewInit(): void {
    // Product Main img Slick
    $('#product-main-img').slick({
      infinite: true,
      speed: 300,
      dots: false,
      arrows: true,
      fade: true,
      asNavFor: '#product-imgs',
    });

    // Product imgs Slick
    $('#product-imgs').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: true,
      centerMode: true,
      focusOnSelect: true,
      centerPadding: 0,
      vertical: true,
      asNavFor: '#product-main-img',
      responsive: [{
        breakpoint: 991,
        settings: {
          vertical: false,
          arrows: false,
          dots: true,
        }
      },
      ]
    });

    // Product img zoom
    var zoomMainProduct = document.getElementById('product-main-img');
    if (zoomMainProduct) {
      $('#product-main-img .product-preview').zoom();
    }
  }

}
