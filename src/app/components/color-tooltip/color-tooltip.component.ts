import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColorContent } from '../../services/color-data.service';

@Component({
  selector: 'app-color-tooltip',
  standalone: true,
  templateUrl: './color-tooltip.component.html',
  styleUrl: './color-tooltip.component.scss',
})
export class ColorTooltipComponent {
  @Input() content: ColorContent | undefined;
  @Input() pinned = false;
  @Input() left = 0;
  @Input() top = 0;

  @Output() close = new EventEmitter<void>();
}
