import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from  '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ProtectedComponent } from './protected/protected.component';
import { LoginComponent } from './login/login.component';
import {
  OKTA_CONFIG,
  OktaAuthModule
} from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { OktaAuthGuard } from '@okta/okta-angular/public-api';
import { BaseRouteReuseStrategy, RouteReuseStrategy } from '@angular/router';

const config = {
  issuer: 'https://dev-32340939.okta.com/oauth2/default',
  clientId: '0oa6q1pc4olhRTTxa5d7',//'0oa68ril6auaQg0IC5d7',
  redirectUri: 'http://localhost:4200/login/callback'
  //redirectUri: window.location.origin + '/callback'
}
const oktaAuth = new OktaAuth(config);

@NgModule({
  declarations: [
    AppComponent,
    ProtectedComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    OktaAuthModule,
    FormsModule
  ],
  providers: [
    {
      provide: OKTA_CONFIG, 
      useValue: { oktaAuth }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
