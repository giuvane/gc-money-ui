import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../seguranca/auth.guard';
import { AgroapikeyCadastroComponent } from './agroapikey-cadastro/agroapikey-cadastro.component';
import { AgroapikeyPesquisaComponent } from './agroapikey-pesquisa/agroapikey-pesquisa.component';


const routes: Routes = [
  {
    path: '',
    component: AgroapikeyPesquisaComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_PESQUISAR_LANCAMENTO'] }
  },
  {
    path: 'novo',
    component: AgroapikeyCadastroComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_CADASTRAR_LANCAMENTO'] }
  },
  {
    path: ':codigo',
    component: AgroapikeyCadastroComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_CADASTRAR_LANCAMENTO'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgroapikeyRoutingModule { }
