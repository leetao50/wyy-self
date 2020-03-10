import { NgModule, InjectionToken } from '@angular/core';

export const API_CONFIG = new InjectionToken('ApiConfigToken');

@NgModule({
  declarations: [],
  imports: [
  ],
  providers:[
    {provide:API_CONFIG,useValue:'http://49.233.165.177/'}
  ]
})
export class ServicesModule { }
