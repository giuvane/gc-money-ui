import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LancamentosPesquisaComponent } from './lancamentos/lancamentos-pesquisa/lancamentos-pesquisa.component';
import { LancamentoCadastroComponent } from './lancamentos/lancamento-cadastro/lancamento-cadastro.component';
import { PessoasPesquisaComponent } from './pessoas/pessoas-pesquisa/pessoas-pesquisa.component';
import { PessoaCadastroComponent } from './pessoas/pessoa-cadastro/pessoa-cadastro.component';
import { PaginaNaoEncontradaComponent } from './core/pagina-nao-encontrada/pagina-nao-encontrada.component';
import { NaoAutorizadoComponent } from './core/nao-autorizado.component';

// Load child adicionado no modulo 21 para carregamento tardio de modulos (Lazy loading)
const routes: Routes = [
  { path: 'lancamentos', loadChildren: './lancamentos/lancamentos.module#LancamentosModule' },
  { path: 'pessoas', loadChildren: './pessoas/pessoas.module#PessoasModule' },
  { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
  { path: 'relatorios', loadChildren: './relatorios/relatorios.module#RelatoriosModule' },
  { path: 'mapas', loadChildren: './mapas/mapas.module#MapasModule' },
  { path: 'sr', loadChildren: './sr/sr.module#SrModule' },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'nao-autorizado', component: NaoAutorizadoComponent },
  { path: 'pagina-nao-encontrada', component: PaginaNaoEncontradaComponent },
  { path: '**', redirectTo: 'pagina-nao-encontrada' }
  // { path: 'lancamentos', component: LancamentosPesquisaComponent }, migrado para lancamentos-routing.module.ts
  // { path: 'lancamentos/novo', component: LancamentoCadastroComponent }, migrado para lancamentos-routing.module.ts
  // { path: 'lancamentos/:codigo', component: LancamentoCadastroComponent }, migrado para lancamentos-routing.module.ts
  // { path: 'pessoas', component: PessoasPesquisaComponent },
  // { path: 'pessoas/novo', component: PessoaCadastroComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
