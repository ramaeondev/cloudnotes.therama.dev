// strip-user-id.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripUserId',
  standalone: true
})
export class StripUserIdPipe implements PipeTransform {
  transform(path: string): string {
    if (!path) return '';
    const parts = path.split('/');
    parts.shift(); // remove the user ID
    return parts.join('/');
  }
}
