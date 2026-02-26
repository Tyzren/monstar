import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-shiny-monstar-title',
  standalone: true,
  imports: [],
  templateUrl: './shiny-monstar-title.component.html',
  styleUrl: './shiny-monstar-title.component.scss'
})
export class ShinyMonstarTitleComponent {
  @Input() size: string = '12rem';

  @HostBinding('style.--title-font-size')
  get fontSize() {
    return this.size;
  }
}
