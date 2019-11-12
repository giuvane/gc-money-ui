import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { Title } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { ToastyModule } from 'ng2-toasty';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { GrowlModule } from 'primeng/growl';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { JwtHelperService } from '@auth0/angular-jwt';

import { NavbarComponent } from './navbar/navbar.component';
import { ErrorHandlerService } from './error-handler.service';
import { LancamentoService } from '../lancamentos/lancamento.service';
import { PessoaService } from '../pessoas/pessoa.service';
import { RouterModule } from '@angular/router';
import { PaginaNaoEncontradaComponent } from './pagina-nao-encontrada/pagina-nao-encontrada.component';
import { AuthService } from '../seguranca/auth.service';
import { NaoAutorizadoComponent } from './nao-autorizado.component';
import { DashboardService } from '../dashboard/dashboard.service';
import { CategoriaService } from '../categorias/categoria.service';
import { RelatorioService } from '../relatorios/relatorio.service';
import { MoneyHttp } from '../seguranca/money-http';

// Método utilizado para aplicar o locale da app para pt-BR
registerLocaleData(localePt);

@NgModule({
  declarations: [
    NavbarComponent,
    PaginaNaoEncontradaComponent,
    NaoAutorizadoComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,

    ToastyModule, // forRoot() utilizado quando se exporta a lib para o modulo principal da aplicação
    GrowlModule,
    MessageModule,
    MessagesModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  exports: [
    // Componentes exportados para serem utilizados no AppComponent (componente principal)
    NavbarComponent,
    ToastyModule,
    GrowlModule,
    MessageModule,
    MessagesModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [
    LancamentoService,
    PessoaService,
    CategoriaService,
    DashboardService,
    RelatorioService,
    ErrorHandlerService,
    AuthService,
    MoneyHttp,

    ConfirmationService, // Serviço utilizado para o ConfirmDialog do primeng
    MessageService,
    JwtHelperService,
    Title,
    {provide: LOCALE_ID , useValue: 'pt-BR' }
  ]
})
export class CoreModule { }
