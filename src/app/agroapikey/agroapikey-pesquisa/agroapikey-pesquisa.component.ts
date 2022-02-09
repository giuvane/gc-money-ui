import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { AgroapikeyFiltro, AgroapikeyService } from '../agroapikey.service';

@Component({
  selector: 'app-agroapikey-pesquisa',
  templateUrl: './agroapikey-pesquisa.component.html',
  styleUrls: ['./agroapikey-pesquisa.component.css']
})
export class AgroapikeyPesquisaComponent implements OnInit {

  agroapikeys = [];
  filtro = new AgroapikeyFiltro();
  totalRegistros = 0;
  @ViewChild('tabela', {static: true}) grid: Table;

  constructor(private agroapikeyService: AgroapikeyService) { }

  ngOnInit() {
  }

}
