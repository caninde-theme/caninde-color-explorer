import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColorContent } from '../../services/color-data.service';

@Component({
  selector: 'app-color-tooltip',
  standalone: true,
  imports: [],
  templateUrl: './color-tooltip.component.html',
  styleUrl: './color-tooltip.component.scss',
})
export class ColorTooltipComponent {
  @Input({ required: true }) content!: ColorContent;
  @Input() pinned = false;
  @Input() left = 0;
  @Input() top = 0;

  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
