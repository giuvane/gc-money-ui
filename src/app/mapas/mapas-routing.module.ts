import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../seguranca/auth.guard';
import { GmapComponent } from './gmap/gmap.component';
import { OlComponent } from './ol/ol.component';
import { AolComponent } from './aol/aol.component';

const routes: Routes = [
  {
    path: '',
    component: OlComponent,
    canActivate: [ AuthGuard ],
    data: { roles: ['ROLE_PESQUISAR_LANCAMENTO'] }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapasRoutingModule  { }
