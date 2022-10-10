import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OktaAuthStateService, OKTA_AUTH } from '@okta/okta-angular';
import { AuthState, OktaAuth, UserClaims } from '@okta/okta-auth-js';
import { FormService } from './form.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  isAuthenticated: boolean = false;

  title = 'okta-spa';
  userClaims: UserClaims | undefined;

  constructor(@Inject(OKTA_AUTH) public oktaAuth: OktaAuth, protected authStateService: OktaAuthStateService, public router: Router) {  }
  


  async ngOnInit() {
    await this.authStateService.authState$.subscribe((v: AuthState) => { 
      if(v.isAuthenticated)
      {
        this.oktaAuth.getUser().then(v => {
          this.userClaims = v;
        });
      }
    })
  }
}
