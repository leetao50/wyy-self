import { Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';

import { Song } from 'src/app/services/data-types/common.types';
import { SongService } from 'src/app/services/song.service';
import { findIndex } from 'src/app/utils/array';
import { WyScrollComponent } from '../wy-scroll/wy-scroll.component';
import { BaseLyricLine, WyLyric } from './wy-lyric';

@Component({
  selector: 'app-wy-player-panel',
  templateUrl: './wy-player-panel.component.html',
  styleUrls: ['./wy-player-panel.component.less']
})
export class WyPlayerPanelComponent implements OnInit,OnChanges {

  @Input() playing:boolean;
  @Input() songList:Song[];
  @Input() currentSong:Song;
  @Input() currentIndex:number;
  @Input() show:boolean;

  @Output() onClose = new EventEmitter<void>();
  @Output() onChagneSong = new EventEmitter<Song>();
  
  @ViewChildren(WyScrollComponent) private wyScroll:QueryList<WyScrollComponent>;

  scrollY =0;
  currentLyric:BaseLyricLine[];
  constructor(private songServe:SongService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['songList']){
      //console.log('s',this.songList);
      this.currentIndex = 0;
    }

    if(changes['currentSong']){

      //console.log("c",this.currentSong);
      if(this.currentSong){
        this.currentIndex =findIndex(this.songList,this.currentSong);
        this.updateLyric();
        if(this.show){
          this.scrollToCurrent();
        }
      }
    }
    if(changes['show']){  
      if(!changes['show'].firstChange && this.show){
        this.wyScroll.first.refershScroll();
        this.wyScroll.last.refershScroll();
        setTimeout(() => {
          if(this.currentSong){
            this.scrollToCurrent(0);
          }
        }, 80);

        }
    }
  }

  updateLyric(){
    this.songServe.getLyric(this.currentSong.id).subscribe(res=>{
      console.log(res.lyric);
      const lyric = new WyLyric(res);
      this.currentLyric = lyric.lines;
      console.log('lines:',this.currentLyric);
      this.wyScroll.last.scrollTo(0,0);
      if(this.playing){
        lyric.play();
      }

    }); 
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
