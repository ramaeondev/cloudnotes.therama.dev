// bytes-to-mb.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bytesToMb'
})
export class BytesToMbPipe implements PipeTransform {
  transform(value: number, decimalPlaces: number = 2): string {
    if (isNaN(value)) return '0 MB';
    const mb = value / (1024 * 1024);
    return `${mb.toFixed(decimalPlaces)} MB`;
  }
}
