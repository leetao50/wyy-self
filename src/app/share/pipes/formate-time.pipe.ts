import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formateTime'
})
export class FormateTimePipe implements PipeTransform {

  transform(value: number): any {
    if(value){
      const temp = value | 0;
      const min = temp/60 | 0;
      const second = (temp%60).toString().padStart(2,'0');
      return `${min}:${second}`;
    }else{
      return '00:00'
    }
  }

}
