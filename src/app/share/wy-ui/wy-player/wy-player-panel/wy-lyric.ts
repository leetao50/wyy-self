import { type } from 'os';
import { from, zip } from 'rxjs';
import { skip } from 'rxjs/internal/operators';
import { Lyric } from 'src/app/services/data-types/common.types';

export interface BaseLyricLine{
    txt: string;
    txtCn: string;
}


const tiemExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

interface LyricLine extends BaseLyricLine{

    time:number;
}

export class WyLyric{
    private lrc:Lyric;
    lines:LyricLine[] = [];
    constructor(lrc:Lyric){
        this.lrc = lrc;
        this.init();
    }

    init(){
        if(this.lrc.tlyric){
            this.generTLyric();
        }else{
            this.generLyric();
        }
    }

    private generTLyric() {
        const lines = this.lrc.lyric.split('\n');
        const tlines = this.lrc.tlyric.split('\n').filter(item=> tiemExp.exec(item)!==null);

        const moreLine = lines.length - tlines.length;

        let tempArr = [];
        if(moreLine>=0){
            tempArr =[lines,tlines];
        }else{
            tempArr = [tlines,lines];
        }

        const first = tiemExp.exec(tempArr[1][0])[0];
        console.log('first',first);
        const skipIndex = tempArr[0].findIndex(item=>{
            const exec =tiemExp.exec(item);

            if(exec){
                return exec[0] === first;
            }
        });

        const _skip = skipIndex === -1 ? 0 : skipIndex;
        const skipItems = tempArr[0].slice(0,_skip);
        if(skipItems.length){
            skipItems.forEach(line => { this.makeLine(line);
                
            });
        }

        let zipLines$;
        if(moreLine > 0){
            zipLines$ =zip(from(lines).pipe(skip(_skip)),from(tlines));
        }else{
            zipLines$ =zip(from(lines),from(tlines).pipe(skip(_skip)));
        }

        zipLines$.subscribe(([lines,tlines]) => this.makeLine(lines,tlines) );
        

    }

    private generLyric() {
        
        const lines = this.lrc.lyric.split('\n');
        lines.forEach(line=> this.makeLine(line));
        
    }

    private makeLine(line:string,tline='') {
        const result = tiemExp.exec(line);


        if(result){
            const txt = line.replace(tiemExp,'').trim();
            const txtCn = tline ? tline.replace(tiemExp,'').trim() : '';
            if(txt){
                let thirdResult = result[3]||'0';
                const len = thirdResult.length;
                const _thirdResult = len>2?parseInt(thirdResult):parseInt(thirdResult)*10;
                const time = Number(result[1])*60*1000 +Number(result[2])*1000+_thirdResult;
                this.lines.push({txt, txtCn, time});
            }
        } 
    }
}