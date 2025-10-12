import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { AgroapikeyFiltro, AgroapikeyService } from '../agroapikey.service';
import { FormControl, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ToastyService } from 'ng2-toasty';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { ConfirmationService } from 'primeng/api';

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

  constructor(
    private agroapikeyService: AgroapikeyService,
          private toasty: ToastyService,
          private errorHandler: ErrorHandlerService,
          private route: ActivatedRoute,
          private confirmation: ConfirmationService,
          private router: Router,
          private title: Title
  ) { }

  ngOnInit() {
    this.carregarApiKeys();
  }

  carregarApiKeys() {
    this.agroapikeyService.getAllAgroApiKey()
      .then(resultado => {
        console.log(resultado)
        this.agroapikeys = resultado.agroApiKeys.map(apiKey => ({ codigo: apiKey.codigo, name: apiKey.name, apikey: apiKey.apikey, usuario: apiKey.usuario }));
        console.log(this.agroapikeys)
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  confirmarExclusao(pessoa: any) {
    this.confirmation.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        // Chamado quando o usuário confirma o dialog
        this.excluir(pessoa);
      }
    });
  }

  excluir(agroApiKey: any) {
    this.agroapikeyService.deleteAgroApiKey(agroApiKey.codigo)
      .then(() => {
        this.grid.reset();
        this.toasty.success('Lançamento excluído com sucesso!');
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

}
