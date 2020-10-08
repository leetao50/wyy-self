import { ElementRef, Input, Inject, ChangeDetectorRef, OnDestroy, forwardRef, Output, EventEmitter } from '@angular/core';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { fromEvent, merge, Observable, Subscriber, Subscription } from 'rxjs';
import { tap, pluck, map, distinctUntilChanged, takeUntil, filter } from 'rxjs/internal/operators';
import { SliderEventObserverConfig, SliderValue } from './wy-slider-types';
import { DOCUMENT } from '@angular/common';
import { sliderEvent, getElementOffset } from './wy-slider-helper';
import { inArray } from 'src/app/utils/array';
import { limitNumberInRange, getPercent } from 'src/app/utils/number';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-wy-slider',
  templateUrl: './wy-slider.component.html',
  styleUrls: ['./wy-slider.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(()=> WySliderComponent),
    multi: true
  }]
})
export class WySliderComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @Input() wyVertical = false;
  @Input() wyMin = 0;
  @Input() wyMax = 100;
  @Input() bufferOffset: SliderValue = 0;
  private sliderDom: HTMLDivElement;
  @Output() changeblur: EventEmitter<any> = new EventEmitter();

  @Output() wyOnAfterChange = new EventEmitter<SliderValue>();

  @ViewChild('wySlider', { static: true } ) private wySlider: ElementRef;

  private dragStart$: Observable<number>;
  private dragMove$: Observable<number>;
  private dragEnd$: Observable<Event>;

  private dragStart_: Subscription | null;
  private dragMove_: Subscription | null;
  private dragEnd_: Subscription | null;

  private isDragging = false;
  private value: SliderValue = null;
   offset: SliderValue = null;
   counts: number = 0;

  constructor(@Inject(DOCUMENT) private doc: Document, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.sliderDom = this.wySlider.nativeElement;
    this.createDraggingObservables();
    this.subscribeDrag(['start']);
  }

  private subscribeDrag(events: string[] = ['start', 'move', 'end']) {
    if (inArray(events, 'start') && this.dragStart$ && !this.dragStart_) {
      this.dragStart_ = this.dragStart$.subscribe(this.onDragStart.bind(this));
    }

    if (inArray(events, 'move') && this.dragMove$ && !this.dragMove_) {
      this.dragMove_ = this.dragMove$.subscribe(this.onDragMove.bind(this));
    }

    if (inArray(events, 'end') && this.dragEnd$ && !this.dragEnd_) {
      this.dragEnd_ = this.dragEnd$.subscribe(this.onDragEnd.bind(this));
    }
  }

  private unsubscribeDrag(events: string[] = ['start', 'move', 'end']) {
    if (inArray(events, 'start') && this.dragStart_) {
      this.dragStart_.unsubscribe();
      this.dragStart_ =  null;
    }

    if (inArray(events, 'move') && this.dragMove_) {
      this.dragMove_.unsubscribe();
      this.dragMove_ = null;
    }

    if (inArray(events, 'end') && this.dragEnd_) {
      this.dragEnd_.unsubscribe();
      this.dragEnd_ = null;
    }
  }

  private onDragStart(value: number) {
    //console.log('start value:' + value);
    this.setValue(value);
    this.cdr.markForCheck();
    this.toggleDragMoving(true);
  }

  private onDragMove(value: number) {
    if (this.isDragging) {
      //console.log('moving ' + value);
      this.setValue(value);
      this.cdr.markForCheck();
    }
  }

  private onDragEnd() {
    this.wyOnAfterChange.emit(this.value);
    this.toggleDragMoving(false);
    this.cdr.markForCheck();

  }

  private setValue(value: SliderValue) {
    if (this.value === value) {
      return;
    }
    this.value = value;
    this.updateTrackAndHandles();
  }
  private updateTrackAndHandles() {
    this.offset = this.getValueOffset(this.value);
    //console.log('offset' + this.offset);
    this.cdr.markForCheck();
  }

  private getValueOffset(value: SliderValue): SliderValue {
    return getPercent(this.wyMin, this.wyMax, value);
  }

  private toggleDragMoving(movable: boolean) {
    this.isDragging = movable;

    if (movable) {
      this.subscribeDrag(['move', 'end']);
    } else {
      this.unsubscribeDrag(['move', 'end']);
    }
  }

  private createDraggingObservables() {
    const orientField =  this.wyVertical ? 'pageY' : 'pageX';

    const mouse: SliderEventObserverConfig = {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseup',
      filter: (e: MouseEvent) => e instanceof MouseEvent,
      pluckKey: [orientField]
    };

    const touch: SliderEventObserverConfig = {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend',
      filter: (e: TouchEvent) => e instanceof TouchEvent,
      pluckKey: ['touches', '0', orientField]
    };

    [mouse, touch].forEach(source => {
      const {start, move, end, filter: filterFunc, pluckKey } = source;

      source.startPlucked$ = fromEvent(this.sliderDom, start)
      .pipe(
        filter(filterFunc),
        tap(sliderEvent),
        pluck(...pluckKey),
        map((position: number) => this.findClosestValue(position))
      );
      source.end$ = fromEvent(this.doc, end);
      source.moveResolved$ = fromEvent(this.doc, move).pipe(
        filter(filterFunc),
        tap(sliderEvent),
        pluck(...pluckKey),
        distinctUntilChanged(),
        map((position: number) => this.findClosestValue(position)),
        takeUntil(source.end$)
      );
    });
    this.dragStart$ = merge(mouse.startPlucked$, touch.startPlucked$);
    this.dragMove$ = merge(mouse.moveResolved$, touch.moveResolved$);
    this.dragEnd$ = merge(mouse.end$, touch.end$);
  }

  private findClosestValue(position: number): number {

    const sliderLength = this.getSliderLength();

    const sliderStart = this.getSliderStartPosition();
    const ratio = limitNumberInRange(( position - sliderStart ) / sliderLength , 0 , 1 );
    const ratioVer = this.wyVertical ? 1 - ratio : ratio;
    return ratioVer * (this.wyMax - this.wyMin) + this.wyMin;
  }

  private getSliderStartPosition() {
    const offset = getElementOffset(this.sliderDom);
    return this.wyVertical ? offset.top : offset.left;
  }

  private getSliderLength() {
    return this.wyVertical ? this.sliderDom.clientHeight : this.sliderDom.clientWidth;
  }

  ngOnDestroy(): void {
    this.unsubscribeDrag();
  }

  private onValueChange(value: SliderValue): void {
    //console.log(value);
    this.changeblur.emit(value);
  }
  private onTouched() {}

  writeValue(obj: SliderValue): void {
    this.setValue(obj);
  }
  registerOnChange(fn: (value: SliderValue) => void): void {
    this.onValueChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

}
