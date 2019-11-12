import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';

import { LoginFormComponent } from './login-form/login-form.component';
import { SegurancaRoutingModule } from './seguranca-routing.module';
import { MoneyHttpInterceptor } from './money-http-interceptor';
import { AuthGuard } from './auth.guard';
import { environment } from './../../environments/environment';

export function tokenGetter(): string {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [LoginFormComponent],
  imports: [

    CommonModule,
    FormsModule,

    InputTextModule,
    ButtonModule,

    SegurancaRoutingModule,

    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: environment.tokenWhitelistedDomains,

          /* Caminhos adicionados em environment.prod.ts com expressão regular
          [
          'http://localhost:8080',
          'localhost:8080',
          'https://algamoney-api-giuvane.herokuapp.com',
          'algamoney-api-giuvane.herokuapp.com',
          ],
          */

        blacklistedRoutes: environment.tokenBlacklistedRoutes

          /* Caminhos adicionados em environment.prod.ts com expressão regular
          [
          'http://localhost:8080/oauth/token',
          'localhost:8080/oauth/token',
          'https://algamoney-api-giuvane.herokuapp.com/oauth/token',
          'algamoney-api-giuvane.herokuapp.com/oauth/token'
          ]
          */

      }
    })
  ],
  providers: [
    AuthGuard
  ]
})
export class SegurancaModule { }
