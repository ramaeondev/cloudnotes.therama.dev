import { Injectable } from "@angular/core";
import { Subject } from "rxjs";


@Injectable({
  providedIn: 'root'
})


export class SharedService {

  private readonly triggerSubject = new Subject<boolean>();
  trigger$ = this.triggerSubject.asObservable();

  sendTrigger(value: boolean) {
    this.triggerSubject.next(value);
  }

}
