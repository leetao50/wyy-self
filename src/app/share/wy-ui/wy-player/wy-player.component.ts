import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppStoreModule } from '../../../store/index';
import { getSongList, getPlayList, getCurrentIndex, getPlayMode, getCurrentSong, getPlayer } from '../../../store/selectors/player.selector';
import { Song } from '../../../services/data-types/common.types';
import { PlayMode } from './player-type';
import { SetCurrentIndex, SetPlayList, SetPlayMode } from 'src/app/store/actions/player.actions';
import { tick } from '@angular/core/testing';
import { SubjectSubscriber } from 'rxjs/internal/Subject';
import { fromEvent, Subscribable, Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { findIndex, shuffle } from 'src/app/utils/array';
import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';

const modeTypes:PlayMode[] =[{
  type:"loop",
  lable:"循环"
},{
  type:"random",
  lable:"随机"
},{
  type:"singleloop",
  lable:"单曲循环"
}]

@Component({
  selector: 'app-wy-player',
  templateUrl: './wy-player.component.html',
  styleUrls: ['./wy-player.component.less']
})
export class WyPlayerComponent implements OnInit {
  
  percent = 0;
  bufferPercent = 0;

  songList: Song[];
  playList: Song[];
  currentIndex: number;
  currentSong: Song;

  duration:number;

  currentTime:number;
  //播放状态
  playing = false;
  //是否可以播放
  songReady = false;

  //音量
  volume = 60;

  //是否显示音量按钮
  showVolumnPanel = false;

  showPanel = false;

  //是否点击音量面板本身
  selfClick= false

  modeCount = 0;
  //
  private winClink: Subscription;

  currentMode :PlayMode;

  @ViewChild('audio', { static: true })
  private audio: ElementRef;
  private audioEl: HTMLAudioElement;


  constructor(
    private store$: Store<AppStoreModule>,
    @Inject(DOCUMENT) private doc: Document
  ) {
    
    const appStore$ = this.store$.pipe(select(getPlayer));
    const stateArr = [{
      type: getSongList,
      cb: list => this.watchList(list, 'songList')
    }, {
      type: getPlayList,
      cb: list => this.watchList(list, 'playList')
    }, {
      type: getCurrentIndex,
      cb: index => this.watchCurrentIndex(index)
    }, {
      type: getPlayMode,
      cb: mode => this.watchPlayMode(mode)
    }, {
      type: getCurrentSong,
      cb: song => this.watchCurrentSong(song)
    }];

    stateArr.forEach(item => {
      appStore$.pipe(select(item.type)).subscribe(item.cb);
    })
     

  }

  ngOnInit() {
    this.audioEl = this.audio.nativeElement;
  }



  private watchList(list: Song[], type: string) {
    this[type] = list;
  }

  private watchCurrentIndex(index: number) {
    this.currentIndex = index;

  }


  private watchPlayMode(mode: PlayMode) {
    this.currentMode = mode;
    if(this.songList){
      let list = this.songList.slice();
      if(mode.type === "random"){
        list = shuffle(this.songList);
        this.updateCurrentIndex(list,this.currentSong);
        this.store$.dispatch(SetPlayList({playList : list}));
      }
    }
  }

  updateCurrentIndex(list:Song[],song:Song){
    const newIndex = findIndex(list,song);
    this.store$.dispatch(SetCurrentIndex({currentIndex:newIndex}));
  }
  

  private watchCurrentSong(song: Song) {
    if(song){
    this.currentSong = song;
    this.duration = song.dt / 1000;
    
  }
  }

  //音量监听
  onVlumeChange(per:number){
    this.audioEl.volume = per/100;
  }

    //控制音量面板
  toggleVolPanel(){
    //evt.stopPropagation();
    this.togglePanel('showVolumnPanel');
  }

  toggleListPanel(){
    if(this.songList.length)
    {
      this.togglePanel('showPanel');
    }
  }

    togglePanel(type:string){

      this[type] = !this[type];

      if(this.showVolumnPanel || this.showPanel){
        this.bindDocumentClickListener();
      }else{
        this.unbindDocumentClickListener();
      }
    }

  private bindDocumentClickListener(){
    if(!this.winClink){
      this.winClink = fromEvent(this.doc , 'click').subscribe(()=>{
        if(!this.selfClick){
          this.showVolumnPanel = false;
          this.showPanel = false;
          this.unbindDocumentClickListener();
        }
        this.selfClick = false;
      })
    }
  }

  private unbindDocumentClickListener() {
    if(this.winClink){
      this.winClink.unsubscribe();
      this.winClink = null;
    }
  }

  changeMode(){
    this.store$.dispatch(SetPlayMode({playMode:modeTypes[++this.modeCount%3]}))
  }



  onTimeUpdate(e:Event){
    this.currentTime = (<HTMLAudioElement>e.target).currentTime;

    this.percent = (this.currentTime / this.duration) * 100;

    const buffered = this.audioEl.buffered;
    if(buffered.length && this.bufferPercent < 100){
      this.bufferPercent = (buffered.end(0)/ this.duration)*100;
    }

    //console.log()
  }

  onPercentChange(per){
    if(this.currentSong){
      this.audioEl.currentTime = this.duration*(per/100);
    }


  }
  //播放/暂停
  onToggle(){
    if(!this.currentSong){
      if(this.playList.length){
        this.store$.dispatch(SetCurrentIndex({currentIndex:0}));
        this.songReady= false;
      }
    }else{
      if(this.songReady){
        this.playing = !this.playing;
        if(this.playing){
          this.audioEl.play();
        }else{
          this.audioEl.pause();
        }
      }
    }
  }
  //上一曲
  onPrev(index: number){
    if(!this.songReady){
      return;
    }
    if(this.playList.length === 1){
      this.loop();
    }else{
      const newIndex = index <= 0 ? this.playList.length-1 : index;
      this.updateIndex(newIndex);
    }
  }

  //下一曲
  onNext(index: number){
    if(!this.songReady){
      return;
    }
    if(this.playList.length === 1){
      this.loop();
    }else{
      const newIndex = index >= this.playList.length ? 0 : index;
      this.updateIndex(newIndex);
    }

  }
  //结束
  onEnded(){
    this.playing = false;
    if(this.currentMode.type==="singleloop"){
      this.loop();
    }else{
      this.onNext(this.currentIndex+1);
    }
  }

  loop(){
    this.audioEl.currentTime=0;
    this.play();
  }

  private updateIndex(index: number){
    this.store$.dispatch(SetCurrentIndex({currentIndex:index}));
    this.songReady = false;
  }

  onCanplay() {
    this.songReady=true;
    this.play();
  }

  private play() {
    this.audioEl.play();
    this.playing= true;
  }

  get picUrl(): string {
    return this.currentSong? this.currentSong.al.picUrl : '';
  }

  //
  onChagneSong(song:Song){
    this.updateCurrentIndex(this.playList,song);
  }

    // 跳转
    toInfo(path: [string, number]) {
      if (path[1]) {
        this.showVolumnPanel = false;
        this.showPanel = false;
        //this.router.navigate(path);
      }
    }
}