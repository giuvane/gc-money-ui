import { Injectable } from '@angular/core';

export class AgroapikeyFiltro {
  nome: string;
  pagina = 0;
  itensPorPagina = 5;
}

@Injectable({
  providedIn: 'root'
})
export class AgroapikeyService {

  constructor() { }

  pesquisar (filtro: AgroapikeyFiltro): void {

  }
}
