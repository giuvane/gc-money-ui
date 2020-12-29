import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { ToastyService } from 'ng2-toasty';
import { MessageService } from 'primeng/components/common/messageservice';
import { NotAuthenticatedError } from '../seguranca/money-http-interceptor';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(
    private toasty: ToastyService,
    private messageService: MessageService,
    private router: Router
    ) { }

  handle(errorResponse: any) {
    let msgUsuario: string;
    let msgDev: string;

    if (typeof errorResponse === 'string') {
      msgUsuario = errorResponse;

    } else if (errorResponse instanceof NotAuthenticatedError) { // Classe NotAuthenticatedError injetada no erro de access token invalido
      msgUsuario = 'Sua sessão expirou!';
      this.router.navigate(['/login']);

    } else if (errorResponse instanceof HttpErrorResponse
        && errorResponse.status >= 400 && errorResponse.status <= 499) {

      msgUsuario = 'Ocorreu um erro ao processar a sua solicitação';

      if (errorResponse.status === 403) {
        msgUsuario = 'Você não tem permissão para executar esta ação';
      }

      try {

        // errors = errorResponse.error; removido após uso do MoneyHttp

        // msgUsuario = errors[0].mensagemUsuario;
        // msgDev = errors[0].mensagemDesenvolvedor;
        msgUsuario = errorResponse.error[0].mensagemUsuario;
        msgDev = errorResponse.error[0].mensagemDesenvolvedor;
      } catch (e) { }

      console.error('Ocorreu um erro', errorResponse);
      console.error('Mensagem do desenvolvedor', msgDev);

    } else {
      msgUsuario = 'Erro ao processar serviço remoto. Tente novamente.';
      console.error('Ocorreu um erro', errorResponse);
    }

    this.messageService.add({ severity: 'error', detail: msgUsuario });
    // this.toasty.error(msgUsuario);
  }
}
