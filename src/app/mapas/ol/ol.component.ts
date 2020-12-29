import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {
  animate, state, style, transition, trigger
} from '@angular/animations';

import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

import * as Proj from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';

@Component({
  selector: 'app-ol',
  templateUrl: './ol.component.html',
  styleUrls: ['./ol.component.css'],
  animations: [
    trigger('state', [
        transition(':enter', [
            style({
                opacity: 0
            }),
            animate(300)
        ]),
        transition(':leave', [
            animate(300),
            style({
                opacity: 0
            })
        ])
    ])
]
})
export class OlComponent implements OnInit, AfterViewInit {

  @ViewChild('map', {static: false}) public mapEl: ElementRef;
  public state: any;
  map: Map;

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit(): void {
    this.map = new Map({
      target: this.mapEl.nativeElement,
      layers: [

        new TileLayer({
          source: new OSM()
      }),
      new TileLayer({
          source: new XYZ({
            // tslint:disable-next-line: max-line-length
            url: 'http://api.agromonitoring.com/tile/1.0/{z}/{x}/{y}/1205e2cd680/5f3282c4714b524c7de0dd68?appid=6475da62dd1776f8852048627272aad0'
          })
        })
      ],
      view: new View({
        center:  Proj.fromLonLat([-53.832572065217384, -25.109259586956515]),
        zoom: 16
      })
    });
  }

}
