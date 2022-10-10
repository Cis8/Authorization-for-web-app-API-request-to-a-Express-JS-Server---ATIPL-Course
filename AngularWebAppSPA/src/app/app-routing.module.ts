import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ProtectedComponent } from './protected/protected.component';
import {
  OktaAuthGuard
} from '@okta/okta-angular';
import { OktaCallbackComponent } from '@okta/okta-angular';

const routes: Routes = [
  { path: 'login', component: LoginComponent  },
  { path: 'login/callback', component: OktaCallbackComponent },
  { path: 'protected', component: ProtectedComponent, canActivate: [ OktaAuthGuard ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
