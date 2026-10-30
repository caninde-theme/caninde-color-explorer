import { Injectable } from '@angular/core';

export interface ColorContent {
  title: string;
  description: string;
  token: string;
  color?: string;
}

interface ColorContentFile {
  regionContent: Record<string, string>;
  contents: Record<string, ColorContent>;
}

@Injectable({
  providedIn: 'root',
})
export class ColorDataService {
  private data?: ColorContentFile;

  async load(): Promise<void> {
    const response = await fetch('/data/color-content.json');

    if (!response.ok) {
      throw new Error(
        `Não foi possível carregar os dados das cores: ${response.status}`,
      );
    }

    this.data = (await response.json()) as ColorContentFile;
  }

  getContentForRegion(label: string): ColorContent | undefined {
    if (!this.data) {
      return undefined;
    }

    const contentId = this.data.regionContent[label];

    if (!contentId) {
      return undefined;
    }

    return this.data.contents[contentId];
  }
}
