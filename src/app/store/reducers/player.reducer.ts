import { PlayMode } from 'src/app/share/wy-ui/wy-player/player-type';
import { Song } from 'src/app/services/data-types/common.types';

export type PlayState = {
    playing: boolean;
    playMode: PlayMode;
    songList: Song[];
    playList: Song[];
    currentIndex: number;
}

export const initialState: PlayState = {
    
}