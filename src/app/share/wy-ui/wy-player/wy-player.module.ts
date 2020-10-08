import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WyPlayerComponent } from './wy-player.component';
import { WySliderModule } from '../wy-slider/wy-slider.module';
import { FormsModule } from '@angular/forms';
import { FormateTimePipe } from '../../pipes/formate-time.pipe';
import { WyPlayerPanelComponent } from './wy-player-panel/wy-player-panel.component';
import { WyScrollComponent } from './wy-scroll/wy-scroll.component';



@NgModule({
  declarations: [WyPlayerComponent,FormateTimePipe, WyPlayerPanelComponent, WyScrollComponent],
  imports: [
    CommonModule,
    FormsModule,
    WySliderModule
    
  ],
  exports:[WyPlayerComponent,WySliderModule,FormateTimePipe]
})
export class WyPlayerModule { }
