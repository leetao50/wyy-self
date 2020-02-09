import { NgModule, SkipSelf, Optional } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from '../app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { ServicesModule } from '../services/services.module';
import { PagesModule } from '../pages/pages.module';
import { ShareModule } from '../share/share.module';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import {NZ_I18N, zh_CN } from 'ng-zorro-antd';

registerLocaleData(zh);
@NgModule({
  declarations: [],
  imports: [
    PagesModule,
    ShareModule,
    ServicesModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  exports:[ShareModule,AppRoutingModule],
  providers: [{ provide: NZ_I18N, useValue: zh_CN }]

})
export class CoreModule { 
  constructor(@SkipSelf() @Optional() parentModule:CoreModule){
    if(parentModule){
      throw new Error('CoreModule 只能被 appModule引用')
    }
  }
}
