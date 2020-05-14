import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { timer, Subscription } from 'rxjs';
import { Treinos } from 'src/app/core/models/treinos/treinos';
import { TreinosService } from 'src/app/core/services/treinos/treinos.service';
import { UtilService } from 'src/app/core/services/util/util.service';
import { TreinoSemanaEdit } from 'src/app/core/models/treinos/treino-semana-edit';
import { LoadingService } from 'src/app/core/services/loading/loading.service';
import { AlertService } from 'src/app/core/services/alert/alert.service';
import { finalize } from 'rxjs/operators';

let _putTreinoSemana$ = new Subscription();

@Component({
  selector: 'app-treino',
  templateUrl: './treino.component.html',
  styleUrls: ['./treino.component.scss'],
})
export class TreinoComponent implements OnInit, OnDestroy {
  subscribeTimer: Subscription = new Subscription();
  timer: number;
  startTreino: boolean = false;
  cronometro: string;
  treino: Treinos = this.navParams.get('treino');

  constructor(private modalController: ModalController,
              private navParams: NavParams,
              private treinosService: TreinosService,
              private utilService: UtilService,
              private loadingService: LoadingService,
              private alertService: AlertService) { }

  ngOnInit() {
  }

  ngOnDestroy(){
    _putTreinoSemana$.unsubscribe();
  }

  iniciarTreino(){
    this.startTreino = !this.startTreino;
    this.startTimer();
  }

  finalizarTreino(){
    this.loadingService.presentLoading('Salvando...');
    this.startTreino = !this.startTreino;
    const _treinoSemana = this.prepareTreinoSemana(); 
    this.putTreinoSemana(_treinoSemana);
  }

  putTreinoSemana(treinoSemanaEdit: TreinoSemanaEdit){
    _putTreinoSemana$ = this.treinosService.putTreinoSemana(treinoSemanaEdit).pipe(
      finalize(()=>{
        this.loadingService.dismissLoading();
      })
    ).subscribe(()=> this.modalController.dismiss(true),
    (error)=> this.alertService.presentErrorAlertDefault('Atenção!',error.error))
  }

  startTimer() {
    this.subscribeTimer = timer(1000, 2000).subscribe(val => {
      this.timer = val;
      this.cronometro = this.transforma_magicamente(this.timer);
    });
  }

  transforma_magicamente(s) {
    function duas_casas(numero) {
      if (numero <= 9) {
        numero = "0" + numero;
      }
      return numero;
    }
    var hora = duas_casas(Math.round(s / 3600));
    var minuto = duas_casas(Math.round((s % 3600) / 60));
    var segundo = duas_casas((s % 3600) % 60);
    var formatado = hora + ":" + minuto + ":" + segundo;
    return formatado;
  }

  stopTimer() {
    this.subscribeTimer.unsubscribe();
  }

  prepareTreinoSemana(): TreinoSemanaEdit{
    const _treinoSemana = new TreinoSemanaEdit();
    _treinoSemana.idTreinoUsuario = this.treino.idTreinoUsuario;
    _treinoSemana.executado = true;
    _treinoSemana.dataExecucao = this.utilService.getDateTimeNow();
    _treinoSemana.tempoTreino = this.timer;
    return _treinoSemana;

  }

  close() {
    this.modalController.dismiss();
  }

}
