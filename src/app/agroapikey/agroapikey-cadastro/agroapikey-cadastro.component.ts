import { Component, OnInit } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ToastyService } from 'ng2-toasty';

import { AgroapikeyService } from '../agroapikey.service';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { AgroApiKey } from 'src/app/core/model';
import { PessoaService } from 'src/app/pessoas/pessoa.service';

@Component({
  selector: 'app-agroapikey-cadastro',
  templateUrl: './agroapikey-cadastro.component.html',
  styleUrls: ['./agroapikey-cadastro.component.css']
})
export class AgroapikeyCadastroComponent implements OnInit {

  agroApiKey = new AgroApiKey();
  usuarios: any[];
  usuarioSelecionado: number;
  editando = false;

  constructor(
      private agroapikeyService: AgroapikeyService,
      private toasty: ToastyService,
      private errorHandler: ErrorHandlerService,
      private route: ActivatedRoute,
      private router: Router,
      private title: Title
    ) {}

  ngOnInit() {
    this.title.setTitle('Nova API Key');

    const codApi = this.route.snapshot.params['codigo'];
    this.carregarUsuarios(codApi)
  }

  carregarUsuarios(codApi: any) {
    this.agroapikeyService.listarUsuarios()
      .then(usuarios => {
        console.log(usuarios)
        this.usuarios = usuarios.map(p => ({ label: p.nome, value: p.codigo }));

        if (codApi) {
          this.editando = true;
          this.carregarApiKeyEdicao(codApi);
        } else {
          this.editando = false;
        }
      })
      .catch(error => this.errorHandler.handle(error));
  }

  carregarApiKeyEdicao(codigo: number) {
    this.agroapikeyService.buscarPorCodigo(codigo)
    .then(agroApiKey => {
      this.agroApiKey = agroApiKey;

      this.usuarioSelecionado = agroApiKey.codUsuario;
    })
    .catch(error => this.errorHandler.handle(error));
  }

  salvar(form: NgForm) {
    if (this.editando) {
      this.atualizarAgroApyKey(form);
    } else {
      this.adicionarAgroApyKey(form);
    }
  }

  adicionarAgroApyKey(form: NgForm) {
    this.agroApiKey.codUsuario = this.usuarioSelecionado;
    this.agroapikeyService.adicionar(this.agroApiKey)
      .then(agroApiAdicionada => {
        this.toasty.success('Agro Api Key adicionada com sucesso!');
        this.router.navigate(['/agroapikey']);
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

  atualizarAgroApyKey(form: NgForm) {
    this.agroapikeyService.atualizar(this.agroApiKey)
      .then(agroApiKey => {
        this.agroApiKey = agroApiKey;

        this.toasty.success('Agro Api Key alterada com sucesso!');
        this.router.navigate(['/agroapikey']);
      })
      .catch(erro => this.errorHandler.handle(erro));
  }

}
