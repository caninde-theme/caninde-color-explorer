import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  readonly repositoryUrl = 'https://github.com/caninde-theme/caninde';

  readonly links = {
    contributing: `${this.repositoryUrl}/blob/main/CONTRIBUTING.md`,
    documentation: `${this.repositoryUrl}/tree/main/docs`,
    issues: `${this.repositoryUrl}/issues`,
    license: `${this.repositoryUrl}/blob/main/LICENSE`,
  };
}
