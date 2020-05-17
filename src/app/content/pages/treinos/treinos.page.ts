import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TreinoComponent } from './treino/treino.component';
import { TreinoNovoComponent } from './treino-novo/treino-novo.component';
import { TreinosSemana } from 'src/app/core/models/treinos/treinos-semana';
import { Subscription } from 'rxjs';
import { TreinosService } from 'src/app/core/services/treinos/treinos.service';
import { Treinos } from 'src/app/core/models/treinos/treinos';
import { finalize } from 'rxjs/operators';
import { UtilService } from 'src/app/core/services/util/util.service';

let _getTreinosSemana$ = new Subscription();

@Component({
  selector: 'app-treinos',
  templateUrl: './treinos.page.html',
  styleUrls: ['./treinos.page.scss'],
})
export class TreinosPage implements OnInit, OnDestroy {
  treinosSemana: TreinosSemana = new TreinosSemana();
  date: Date = new Date();

  constructor(private modalController: ModalController,
              private treinosService: TreinosService,
              private cdr: ChangeDetectorRef,
              public utilService: UtilService) { }

  ngOnInit() {
    this.getTreinosSemana();
  }

  ngOnDestroy() {
    _getTreinosSemana$.unsubscribe();
  }

  enbaleTreinoNovo(dataFim: string){
    if(dataFim != undefined && dataFim != null){
      return this.date.toISOString() > dataFim;
    }
    return true;
  }

  getTempMedioTreino(tempoTreino: number): string{
    let timer: string = this.utilService.transforma_segundosEmHoras(tempoTreino);
    let hh: string = timer.split(":")[0];
    let mm: string = timer.split(":")[1];
    let ss: string = timer.split(":")[2];

    if(hh != "00"){
      return hh + " " + "hrs";
    }
    else if(mm != "00"){
      return mm + " " + "min";
    }

    return ss + " " + "seg";
  }


  getTreinosSemana(forceRefresh: boolean = false, event?: any) {
    _getTreinosSemana$ = this.treinosService.getTreinosSemana(forceRefresh).pipe(
      finalize(() => {
        if (event) {
          event.target.complete();
        }
        this.cdr.detectChanges();
      })
    ).subscribe((result) => {
        if (result) {
          this.treinosSemana = result.dados[0];
        }
        if(!forceRefresh){
          this.getTreinosSemana(true)
        }
      })
  }

  async openNovoTreino() {
    const modal = await this.modalController.create({
      component: TreinoNovoComponent
    });

    modal.onDidDismiss()
    .then((result) => {
      if (result.data){    
       this.getTreinosSemana(true)
      }         
    });
    return await modal.present();
  }


  async openTreino(treino: Treinos) {
    const modal = await this.modalController.create({
      component: TreinoComponent,
      componentProps: { treino }
    });
    return await modal.present();
  }

}
