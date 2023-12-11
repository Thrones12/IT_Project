import {Component, OnInit} from '@angular/core';
import {SocialAuthService, SocialUser} from "@abacritt/angularx-social-login";
import {ResponseModel, UserService} from "../../services/user.service";
import {Router} from "@angular/router";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  myUser: any;
  constructor(private authService: SocialAuthService,
              private userService: UserService,
              private router: Router) {
  }
  ngOnInit(){
    this.userService.userData$
      .pipe(
        map(user => {
          if (user instanceof SocialUser) {
            return {
              ...user,
              email: 'test@test.com',

            };
          } else {
            return user;
          }
        })
      )
      .subscribe((data: ResponseModel | SocialUser) => {
        this.myUser = data;
      });
  }

  logout() {
    this.userService.logout();
  }
}
