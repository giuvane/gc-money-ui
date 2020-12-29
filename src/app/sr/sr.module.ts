import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterModule } from '@angular/router';
import { InputMaskModule } from 'primeng/inputmask';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { PickListModule } from 'primeng/picklist';
import { ChartModule } from 'primeng/chart';
import { GMapModule } from 'primeng/gmap';
import { CheckboxModule } from 'primeng/checkbox';

import { SrRoutingModule } from './sr-routing.module';
import { SrPesquisaComponent } from './sr-pesquisa/sr-pesquisa.component';
import { SrCadastroComponent } from './sr-cadastro/sr-cadastro.component';
import { SharedModule } from '../shared/shared.module';
import { SrImagensComponent } from './sr-imagens/sr-imagens.component';


@NgModule({
  declarations: [SrPesquisaComponent, SrCadastroComponent, SrImagensComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    InputTextModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    InputTextareaModule,
    CalendarModule,
    SelectButtonModule,
    DropdownModule,
    AngularFontAwesomeModule,
    CurrencyMaskModule,
    FileUploadModule,
    ProgressSpinnerModule,
    InputMaskModule,
    PanelModule,
    DialogModule,
    DropdownModule,
    TreeModule,
    PickListModule,
    ChartModule,
    CheckboxModule,

    GMapModule,

    SharedModule,
    SrRoutingModule
  ]
})
export class SrModule { }
