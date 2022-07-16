import { Pipe, PipeTransform } from '@angular/core';
import {Myt} from '../models/myt.models';


@Pipe({
  name: 'mytOrderBy',
  pure: false
})
export class MytOrderByPipe implements PipeTransform {
  transform(myts: Myt[], propName: string) {

    return myts.sort((a: Myt, b: Myt): number => {
      // @ts-ignore
      if (a[propName] < b[propName]) {
        return -1;
      // @ts-ignore
      } else if (a[propName] > b[propName]) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
