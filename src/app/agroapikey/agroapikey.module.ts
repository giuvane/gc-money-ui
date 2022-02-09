import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { AgroapikeyRoutingModule } from './agroapikey-routing.module';
import { AgroapikeyCadastroComponent } from './agroapikey-cadastro/agroapikey-cadastro.component';
import { AgroapikeyPesquisaComponent } from './agroapikey-pesquisa/agroapikey-pesquisa.component';

import { SharedModule } from '../shared/shared.module';
import { TooltipModule } from 'primeng/tooltip';
import { InputMaskModule } from 'primeng/inputmask';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';



@NgModule({
  declarations: [AgroapikeyCadastroComponent, AgroapikeyPesquisaComponent],
  imports: [
    CommonModule,

    InputTextModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    InputMaskModule,
    PanelModule,
    DialogModule,

    SharedModule,
    AgroapikeyRoutingModule
  ]
})
export class AgroapikeyModule { }
