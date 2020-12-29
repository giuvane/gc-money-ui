import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GMapModule } from 'primeng/gmap';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

import { MapasRoutingModule } from './mapas-routing.module';
import { GmapComponent } from './gmap/gmap.component';
import { SharedModule } from '../shared/shared.module';
import { OlComponent } from './ol/ol.component';
import { AolComponent } from './aol/aol.component';
//import { AngularOpenlayersModule } from 'ngx-openlayers';
//import { NgOpenlayersModule } from 'ng-openlayers-lib';

@NgModule({
  declarations: [GmapComponent, OlComponent, AolComponent],
  imports: [
    CommonModule,
    FormsModule,

    GMapModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    //AngularOpenlayersModule,
    //NgOpenlayersModule,

    SharedModule,
    MapasRoutingModule
  ]
})
export class MapasModule {

  mapasUrl: string;

 }
