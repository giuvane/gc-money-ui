import { Injectable } from '@angular/core';

import { MoneyHttp } from '../seguranca/money-http';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapasService {

  mapasUrl: string;

  constructor(private http: MoneyHttp) {
    this.mapasUrl = `${environment.apiUrl}/mapas`;
   }
}
