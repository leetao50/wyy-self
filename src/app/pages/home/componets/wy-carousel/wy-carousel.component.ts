import { Component, OnInit, TemplateRef, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-wy-carousel',
  templateUrl: './wy-carousel.component.html',
  styleUrls: ['./wy-carousel.component.less'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class WyCarouselComponent implements OnInit {

  @Input() activeIndex=0;
  @Output() changeSlide = new EventEmitter<string>();
  constructor() { }
  @ViewChild('dot',{static:true}) public dotRef:TemplateRef<any>;
  ngOnInit(): void {
  }


  onChangeSlide(type:string){
    this.changeSlide.emit(type);
  }

}
