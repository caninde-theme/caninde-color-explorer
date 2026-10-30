import { Component } from '@angular/core';

@Component({
  selector: 'app-contribute',
  standalone: true,
  templateUrl: './contribute.component.html',
  styleUrl: './contribute.component.scss',
})
export class ContributeComponent {
  readonly repositoryUrl = 'https://github.com/caninde-theme/caninde';

  readonly links = {
    contributing: `${this.repositoryUrl}/blob/main/CONTRIBUTING.md`,
    porting: `${this.repositoryUrl}/blob/main/docs/PORTING.md`,
    issues: `${this.repositoryUrl}/issues`,
    newIssue: `${this.repositoryUrl}/issues/new/choose`,
  };
}
