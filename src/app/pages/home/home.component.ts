import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { HomeService } from 'src/app/services/home.service';
import { NzCarouselComponent } from 'ng-zorro-antd';
import { Banner, HotTag, SongSheet, Singer } from 'src/app/services/data-types/common.types';
import { SingerService } from 'src/app/services/singer.service';
import { SheetService } from 'src/app/services/sheet.service';
import { AppStoreModule } from 'src/app/store';
import { select, Store } from '@ngrx/store';
import { SetCurrentIndex, SetPlaying, SetPlayList, SetSongList } from 'src/app/store/actions/player.actions';
import { PlayState } from 'src/app/store/reducers/player.reducer';
import { findIndex, shuffle } from 'src/app/utils/array';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {
  banners: Banner[];
  hotTags: HotTag[];
  songSheet:SongSheet[];
  singers:Singer[];

  playerState:PlayState;

  @ViewChild(NzCarouselComponent,{static:false})  carousel:NzCarouselComponent;

  constructor(private homeService:HomeService,
    private singerService:SingerService,
    private sheetService:SheetService,
    private store$: Store<AppStoreModule>
    ) {
    this.getBananers();

    this.getHotTags();

    this.getSongSheet();

    this.getEnterSinger();

    this.store$.pipe(select('player')).subscribe(res=> this.playerState = res)
   }

   getEnterSinger(){
    this.singerService.getEnterSinger().subscribe(tags=>{
      console.log(tags);
      
      this.singers=tags;
    })
   }

   getHotTags(){
    this.homeService.getHotTags().subscribe(tags=>{
      this.hotTags=tags;
    })
   }

   getSongSheet(){
     this.homeService.getPersonalSheetList().subscribe(song=>{
       console.log('song'+song);
       this.songSheet=song;
     })
   }
   getBananers(){

    this.homeService.getBanners().subscribe(banners=>{
      this.banners=banners;
    })

   }

   indexNumber=0;

   onBeforeChange({to}){
    this.indexNumber = to;
   }

   onChangeSlide(type:string){
     
    this.carousel[type]();
   }

   onPlaySheet(id:number){
    
     this.sheetService.playSheet(id).subscribe(list=>{

       this.store$.dispatch(SetSongList({songList: list }));

       let trueIndex = 0;
       let trueList = list.slice();
       if(this.playerState.playMode.type === 'random'){
         trueList =  shuffle(list||[]);
         trueIndex =findIndex(trueList,list[trueIndex]);
       }

       this.store$.dispatch(SetPlayList({playList: trueList }));
       this.store$.dispatch(SetCurrentIndex({currentIndex: trueIndex }));
     })
   }

  ngOnInit(): void {
  }

}
