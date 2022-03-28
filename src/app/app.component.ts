import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AppService} from "./app.service";
import {Currency} from "./types/currencies";
import {FormControl} from "@angular/forms";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly searchFormControl: FormControl = new FormControl(null);

  constructor(public appService: AppService) {
  }

  ngOnInit(): void {
    this.searchFormControl.valueChanges.subscribe({
      next: (text) => {
        this.appService.search(text);
      }
    });
  }


  trackCurrenciesByCode(
    _index: number,
    currency: Currency,
  ): string {
    return currency?.code;
  }
}
