import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorTooltipComponent } from './color-tooltip.component';

describe('ColorTooltipComponent', () => {
  let component: ColorTooltipComponent;
  let fixture: ComponentFixture<ColorTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorTooltipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
