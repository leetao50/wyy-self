
export type Banner = {
    targetId:number;
    url:string;
    imageUrl:string
}


export type HotTag = {
    id:number;
    name:string;
    position:number
}


export type SongSheet = {
    id:number;
    name:string;
    picUrl:string;
    playCount:number;
    tracks:Song[]
}


export type Singer = {
    id:number;
    name:string;
    picUrl:string,
    albumSize:number
}


export type Song = {
    id:number;
    name:string;
    url:string;
    dt:number;
    al:{id:number;name:string;picUrl:string},
    ar:Singer[];
}



export type SongUrl = {
    id:number;
    url:string;
}


