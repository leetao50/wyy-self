import { Injectable, Inject } from '@angular/core';
import { ServicesModule, API_CONFIG } from './services.module';
import { Observable, from } from 'rxjs';
import { Singer, HotTag, SongSheet } from './data-types/common.types';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/internal/operators';
import queryString from 'query-string';


type SingerParams={
    offset:number;
    limit:number;
    cat?:string;
   }

   const defaultParams:SingerParams ={
    offset:0,
    limit:9,
    cat:'5001'
   }

@Injectable({
  providedIn: ServicesModule
})
export class SingerService {

  constructor(private http:HttpClient ,@Inject(API_CONFIG) private url:string ) {}

  getEnterSinger(args:SingerParams = defaultParams):Observable<Singer[]>{
      const params = new HttpParams({fromString: queryString.stringify(args) })
    return this.http.get(this.url+'artist/list',{params})
    .pipe(map((res: { artists: Singer[] }) => res.artists));
  }


}
