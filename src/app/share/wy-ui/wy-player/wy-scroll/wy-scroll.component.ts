import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, AfterViewInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import BScroll from '@better-scroll/core';
import ScrollBar from '@better-scroll/scroll-bar';
import MouseWheel from '@better-scroll/mouse-wheel';
import { timer } from 'rxjs';


BScroll.use(MouseWheel);
BScroll.use(ScrollBar);

@Component({
  selector: 'app-wy-scroll',
  template: `
   <div class="wy-scroll" #wrap>
    <ng-content></ng-content>
   </div>
  `,
  styles: [`.wy-scroll{width:100%;height:100%;overflow:hidden;}`],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WyScrollComponent implements OnInit, AfterViewInit,OnChanges {

  @Input() data: any[];
  @Input() refershDely:number = 50;

  @Output() onScrollEnd = new EventEmitter<number>();
  private bs:BScroll;

  //在调用 NgAfterViewInit 回调函数之前就会设置这些视图查询。
  @ViewChild('wrap',{static:true}) private wrapRef:ElementRef;
  constructor(readonly el:ElementRef) { }


  ngOnChanges(changes: SimpleChanges): void {
    if(changes["data"]){
      this.refershScroll();
    }
  }
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.bs = new BScroll(this.wrapRef.nativeElement,{
      scrollbar:{
        interactive:true
      },
      mouseWheel: {
        speed: 20,
        invert: false,
        easeTime: 300
      }
    });
    this.bs.on('scrollEnd',({y})=>this.onScrollEnd.emit(y))
  }

  refershScroll(){
    setTimeout(() => {
      this.bs.refresh();
    }, this.refershDely);
  }
  scrollToElement(...args){
    this.bs.scrollToElement.apply(this.bs,args);
  }

  scrollTo(...args){
    this.bs.scrollTo.apply(this.bs,args);
  }

}
