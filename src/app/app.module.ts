import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, LOCALE_ID } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
// import { Routes, RouterModule } from '@angular/router';
// import { registerLocaleData } from '@angular/common';
// import localePt from '@angular/common/locales/pt';

// import { ToastyModule } from 'ng2-toasty';
// import { ConfirmDialogModule } from 'primeng/components/confirmdialog/confirmdialog';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
// import { LancamentosModule } from './lancamentos/lancamentos.module';
// import { PessoasModule } from './pessoas/pessoas.module';
import { CoreModule } from './core/core.module';
import { SegurancaModule } from './seguranca/seguranca.module';
import { NaoAutorizadoComponent } from './core/nao-autorizado.component';
// import { LancamentosPesquisaComponent } from './lancamentos/lancamentos-pesquisa/lancamentos-pesquisa.component';
// import { LancamentoCadastroComponent } from './lancamentos/lancamento-cadastro/lancamento-cadastro.component';
// import { PessoasPesquisaComponent } from './pessoas/pessoas-pesquisa/pessoas-pesquisa.component';
// import { PessoaCadastroComponent } from './pessoas/pessoa-cadastro/pessoa-cadastro.component';
// import { PaginaNaoEncontradaComponent } from './core/pagina-nao-encontrada/pagina-nao-encontrada.component';

// import { LancamentoService } from './lancamentos/lancamento.service';
// import { PessoaService } from './pessoas/pessoa.service';
// import { ConfirmationService } from 'primeng/components/common/api';

// Movidos para Core Module
// Método utilizado para aplicar o locale da app para pt-BR
// registerLocaleData(localePt);

/* rotas migradas para app-routing.module.ts
const routes: Routes = [
  { path: '', redirectTo: 'lancamentos', pathMatch: 'full' },
  { path: 'lancamentos', component: LancamentosPesquisaComponent },
  { path: 'lancamentos/novo', component: LancamentoCadastroComponent },
  { path: 'lancamentos/:codigo', component: LancamentoCadastroComponent },
  { path: 'pessoas', component: PessoasPesquisaComponent },
  { path: 'pessoas/novo', component: PessoaCadastroComponent },
  { path: 'pagina-nao-encontrada', component: PaginaNaoEncontradaComponent },
  { path: '**', redirectTo: 'pagina-nao-encontrada' }
];
*/

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // Movidos para o Core Module
    // ToastyModule.forRoot(), // forRoot() utilizado quando se exporta a lib para o modulo principal da aplicação
    // ConfirmDialogModule,

    // LancamentosModule, // Removido no modulo 20, na configuração de Lazy loading de modulos
    // PessoasModule, // Removido no modulo 20, na configuração de Lazy loading de modulos
    CoreModule,
    SegurancaModule,

    // RouterModule.forRoot(routes), migrado para AppRoutingModule
    AppRoutingModule
  ],
  providers: [
    // Movidos para Core Module
    // LancamentoService,
    // PessoaService,
    // ConfirmationService, // Serviço utilizado para o ConfirmDialog do primeng
    // {provide: LOCALE_ID , useValue: 'pt-BR' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
