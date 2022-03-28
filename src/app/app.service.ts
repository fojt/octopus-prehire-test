import {Injectable} from "@angular/core";
import {BehaviorSubject, delay, finalize} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CurrenciesResponse, Currency, CurrencyDetailResponse} from "./types/currencies";
import {ChartConfiguration} from "chart.js";
import {config} from "../config";


@Injectable({
  providedIn: 'root',
})
export class AppService {

  private currenciesList: Currency[] = [];
  public readonly currenciesListIsLoadingSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly currenciesListSubject$: BehaviorSubject<Currency[]> = new BehaviorSubject<Currency[]>([]);
  public readonly currenciesListErrorSubject$: BehaviorSubject<string> = new BehaviorSubject<string>('');


  public readonly currencyDetailTransformedSubject$: BehaviorSubject<ChartConfiguration['data'] | undefined>
    = new BehaviorSubject<ChartConfiguration['data'] | undefined>(undefined);
  public readonly currencyDetailAverageSubject$: BehaviorSubject<number | undefined>
    = new BehaviorSubject<number | undefined>(undefined);

  public readonly currencyDetailErrorSubject$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public readonly currencyDetailIsLoadingSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  getLastMonthNames(count: number): string[] {
    const current = new Date();
    const monthNames = [];
    for (let i = 1; i <= count; i++) {
      current.setMonth(current.getMonth() - 1);
      const previousMonth = current.toLocaleString('default', {month: 'long'});
      monthNames.push(previousMonth)
    }
    return monthNames.reverse();
  }

  constructor(private readonly httpClient: HttpClient) {
    this.getCurrenciesList();
  }

  private removeAccentsDiacritics(string: string): string {
    return string
      // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      ;
  }

  search(searchText: string): void {
    searchText = this.removeAccentsDiacritics(searchText.toLocaleLowerCase())
    if (searchText) {
      this.currenciesListSubject$.next([...
        this.currenciesList.filter((currency) => {
          const country = this.removeAccentsDiacritics(currency.country.toLocaleLowerCase())
          const code = this.removeAccentsDiacritics(currency.code.toLocaleLowerCase())
          return country.indexOf(searchText) > -1 || code.indexOf(searchText) > -1;
        })
      ]);
    } else {
      this.currenciesListSubject$.next([...this.currenciesList]);
    }
  }

  getCurrenciesList(): void {
    this.currenciesListIsLoadingSubject$.next(true);

    this.httpClient.get<CurrenciesResponse>(config.api.currenciesList, {responseType: 'json'})
      .pipe(
        delay(config.api.currenciesListDelay),
        finalize(() => {
          this.currenciesListIsLoadingSubject$.next(false);
        })
      )
      .subscribe({
        next: (data: CurrenciesResponse) => {
          if (Array.isArray(data.currencies)) {
            this.currenciesList = data.currencies
              .sort((a, b) => a.country.localeCompare(b.country))
            this.currenciesListSubject$.next([...this.currenciesList]);
          } else {
            this.currenciesListErrorSubject$.next('There is no currency list in the currencies.json file');
          }
        },
        error: () => {
          this.currenciesListErrorSubject$.next('The currencies.json file is unavailable');
        }
      });
  }

  getCountryFromCurrencyCode(currencyCode: string): string {
    const list = this.currenciesList.filter((currency) => currency.code === currencyCode)
    if (list.length > 0) {
      return list[0].country;
    }
    return '';
  }

  processDetailData(currencyCode: string, rates: number[]): void {
    const data = rates.slice(0, config.detail.numberOfMonths);

    const sum = data.reduce((a, b) => a + b, 0);
    const avg = (sum / data.length) || 0;
    this.currencyDetailAverageSubject$.next(avg);

    const lineChartData: ChartConfiguration['data'] = {
      datasets: [
        {
          data: data,
          label: currencyCode + ' / CZK',
        }
      ],
      labels: this.getLastMonthNames(data.length)
    };
    this.currencyDetailTransformedSubject$.next(lineChartData);
  }

  getCurrencyDetail(currencyCode: string): void {
    this.currencyDetailTransformedSubject$.next(undefined);
    this.currencyDetailAverageSubject$.next(undefined);
    this.currencyDetailErrorSubject$.next('');

    this.currencyDetailIsLoadingSubject$.next(true);

    this.httpClient.get<CurrencyDetailResponse>(config.api.currencyDetail(currencyCode), {responseType: 'json'})
      .pipe(
        delay(config.api.currencyDetailDelay),
        finalize(() => {
          this.currencyDetailIsLoadingSubject$.next(false);
        })
      )
      .subscribe({
        next: (data: CurrencyDetailResponse) => {
          if (Array.isArray(data.rates)) {
            this.processDetailData(currencyCode, data.rates);
          } else {
            this.currencyDetailErrorSubject$.next('There is no rates for the the currency');
          }
        },
        error: error => {
          this.currencyDetailErrorSubject$.next('The ' + currencyCode + '.json file is unavailable');
        }
      });
  }


}
