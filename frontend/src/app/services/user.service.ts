import { Injectable } from '@angular/core';
import {GoogleLoginProvider, SocialAuthService, SocialUser} from "@abacritt/angularx-social-login";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  auth = false;
  private SERVER_URL = 'http://localhost:3000/api'
  // @ts-ignore
  private user;
  authState$ = new BehaviorSubject<boolean>(this.auth);
  // @ts-ignore
  userData$ = new BehaviorSubject<SocialUser | ResponseModel>(null);
  constructor(private authService: SocialAuthService,
              private httpClient: HttpClient) {

    authService.authState.subscribe((user: SocialUser) => {
      if (user != null) {
        this.auth = true;
        this.authState$.next(this.auth);
        this.userData$.next(user);
      }
    });

  }

    //Login with email and password
    loginUser(email: string, password: string){
      // @ts-ignore
      this.httpClient.post(`${this.SERVER_URL}/auth/login`, { email, password}).subscribe((data: ResponseModel)=> {
          this.auth = data.auth;
          this.authState$.next(this.auth);
          this.userData$.next(data);
        });
  }
  //Google authentication
  googleLogin(){
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);

  }

  logout(){
    this.authService.signOut();
    this.auth = false;
    this.authState$.next(this.auth);
  }
}




export interface ResponseModel{
  token: string;
  auth: boolean;
  email:string;
  username:string;
  fname:string;
  lname:string;
  photoUrl:string;
  userId:string;
}
