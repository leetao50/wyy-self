import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { HomeService } from 'src/app/services/home.service';
import { NzCarouselComponent } from 'ng-zorro-antd';
import { Banner, HotTag, SongSheet, Singer } from 'src/app/services/data-types/common.types';
import { SingerService } from 'src/app/services/singer.service';
import { SheetService } from 'src/app/services/sheet.service';

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

  @ViewChild(NzCarouselComponent,{static:false})  carousel:NzCarouselComponent;

  constructor(private homeService:HomeService,private singerService:SingerService,private sheetService:SheetService) {
    this.getBananers();

    this.getHotTags();

    this.getSongSheet();

    this.getEnterSinger();

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
     console.log(id);
     this.sheetService.playSheet(id).subscribe(rec=>{
       console.log('rec',rec);
     })
   }

  ngOnInit(): void {
  }

}
