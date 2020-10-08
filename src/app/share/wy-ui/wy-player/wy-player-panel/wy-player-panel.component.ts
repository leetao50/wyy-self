import { Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';

import { Song } from 'src/app/services/data-types/common.types';
import { findIndex } from 'src/app/utils/array';
import { WyScrollComponent } from '../wy-scroll/wy-scroll.component';

@Component({
  selector: 'app-wy-player-panel',
  templateUrl: './wy-player-panel.component.html',
  styleUrls: ['./wy-player-panel.component.less']
})
export class WyPlayerPanelComponent implements OnInit,OnChanges {

  @Input() songList:Song[];
  @Input() currentSong:Song;
  @Input() currentIndex:number;
  @Input() show:boolean;

  @Output() onClose = new EventEmitter<void>();
  @Output() onChagneSong = new EventEmitter<Song>();
  
  @ViewChildren(WyScrollComponent) private wyScroll:QueryList<WyScrollComponent>;

  scrollY =0;
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['songList']){
      //console.log('s',this.songList);
      this.currentIndex = 0;
    }

    if(changes['currentSong']){

      //console.log("c",this.currentSong);
      if(this.currentSong){
        this.currentIndex =findIndex(this.songList,this.currentSong);
        if(this.show){
          this.scrollToCurrent();
        }
      }
    }
    if(changes['show']){  
      if(!changes['show'].firstChange && this.show){
        this.wyScroll.first.refershScroll();
        setTimeout(() => {
          if(this.currentSong){
            this.scrollToCurrent(0);
          }
        }, 80);

        }
    }
  }

  ngOnInit(): void {
  }

  private scrollToCurrent(speed=300){
    const songListRefs = this.wyScroll.first.el.nativeElement.querySelectorAll('ul li');
    if(songListRefs.length){
      const currentLi = <HTMLElement>songListRefs[this.currentIndex||0];
      const offsetTop = currentLi.offsetTop;
      const offsetHeight = currentLi.offsetHeight;


      if((offsetTop - Math.abs(this.scrollY) > offsetHeight * 5) ||( offsetTop < Math.abs(this.scrollY))){
        this.wyScroll.first.scrollToElement(currentLi,speed,false,false);

      }
    }

  }


}
