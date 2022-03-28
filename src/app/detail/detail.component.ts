import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AppService} from "../app.service";
import {BehaviorSubject, Subject, takeUntil} from "rxjs";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy{


  code$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  error$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  country$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  private notifier = new Subject();


  constructor(
    private route: ActivatedRoute,
    public appService: AppService
  ) {
  }

  ngOnInit(): void {

    if(this.appService.currenciesListIsLoadingSubject$.getValue()){
      this.appService.currenciesListIsLoadingSubject$
        .pipe(takeUntil(this.notifier))
        .subscribe(
        {
          next: (isLoading) => {
            if(!isLoading){
             this.getDetailData();
            }
          }
        }
      )
    } else {
      this.getDetailData();
    }

  }

  getDetailData(): void {

    this.route.params
      .pipe(takeUntil(this.notifier))
      .subscribe({
      next: (params)=> {
        this.error$.next('');
        let currencyCode = '';
        if('currencyCode' in params){
          currencyCode = params['currencyCode']
        } else {
          return;
        }

        const country = this.appService.getCountryFromCurrencyCode(currencyCode);
        if(country) {
          this.code$.next(currencyCode);
          this.country$.next(country);
          this.appService.getCurrencyDetail(currencyCode);
        } else {
          this.error$.next(currencyCode + ' - this currency does not exist in our list of currencies');
        }
      }
    });
  }

  ngOnDestroy() {
    this.notifier.next(undefined);
    this.notifier.complete()
  }
}
