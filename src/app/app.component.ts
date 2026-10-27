import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import Konva from 'konva';

interface TackPoint {
  x: number;
  y: number;
}

interface TackShape {
  id: string;
  label: string;
  type: string;
  closed: boolean;
  points: TackPoint[];
}

interface TackDocument {
  width: number;
  height: number;
  units: string;
  shapes: TackShape[];
}

interface RegionInfo {
  title: string;
  token: string;
  description: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy {
  private stage?: Konva.Stage;
  private layer?: Konva.Layer;
  private resizeObserver?: ResizeObserver;

  private initializationStarted = false;

  hoveredId: string | null = null;
  pinnedId: string | null = null;

  regions: TackShape[] = [];

  imageWidth = 5026;
  imageHeight = 3351;

  loading = true;
  error = '';

  readonly details: Record<string, RegionInfo> = {
    bico_white: {
      title: 'Bico claro',
      token: 'A definir no Canindé',
      description:
        'Região clara do bico da arara. Aqui serão exibidos os tokens e exemplos de aplicação.',
    },

    bico_black: {
      title: 'Bico escuro',
      token: 'A definir no Canindé',
      description:
        'Região escura do bico da arara. Aqui serão exibidos os tokens e exemplos de aplicação.',
    },

    asa_amarela: {
      title: 'Penas amarelas',
      token: 'A definir no Canindé',
      description:
        'Região amarela da plumagem. Aqui serão exibidos os tokens e exemplos de aplicação.',
    },
  };

  @ViewChild('stageHost')
  set stageHostRef(ref: ElementRef<HTMLDivElement> | undefined) {
    if (!ref || this.initializationStarted) {
      return;
    }

    this.initializationStarted = true;

    void this.initializeStage(ref.nativeElement).catch((error: unknown) => {
      this.error =
        error instanceof Error
          ? error.message
          : 'Erro ao inicializar a imagem.';

      this.loading = false;
    });
  }

  constructor() {
    void this.loadRegions();
  }

  get activeId(): string | null {
    return this.pinnedId ?? this.hoveredId;
  }

  get activeShape(): TackShape | undefined {
    return this.regions.find((shape) => shape.label === this.activeId);
  }

  get activeDetails(): RegionInfo | undefined {
    return this.activeId ? this.details[this.activeId] : undefined;
  }

  get modalPosition(): { left: number; top: number } {
    const shape = this.activeShape;

    if (!shape?.points.length) {
      return { left: 50, top: 50 };
    }

    const xs = shape.points.map((point) => point.x);
    const ys = shape.points.map((point) => point.y);

    return {
      left: ((Math.min(...xs) + Math.max(...xs)) / 2) * 100,

      top: Math.min(88, Math.max(4, Math.min(...ys) * 100)),
    };
  }

  private async loadRegions(): Promise<void> {
    try {
      const response = await fetch('/color-regions/macaw-regions.json');

      if (!response.ok) {
        throw new Error('Não foi possível carregar os polígonos.');
      }

      const data = (await response.json()) as TackDocument;

      if (data.units !== 'norm') {
        throw new Error('Esperava coordenadas normalizadas (units: norm).');
      }

      this.imageWidth = data.width;
      this.imageHeight = data.height;

      this.regions = data.shapes.filter(
        (shape) => shape.type === 'polygon' && shape.closed,
      );

      if (this.regions.length === 0) {
        throw new Error('Nenhum polígono fechado foi encontrado no JSON.');
      }

      this.loading = false;
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Erro ao carregar as regiões.';

      this.loading = false;
    }
  }

  private async initializeStage(host: HTMLDivElement): Promise<void> {
    const image = new Image();

    image.src = '/images/macaws.webp';

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();

      image.onerror = () => {
        reject(new Error('Não foi possível carregar macaws.webp.'));
      };
    });

    const render = (): void => {
      const width = host.clientWidth;

      if (width <= 0) {
        return;
      }

      const height = width * (this.imageHeight / this.imageWidth);

      if (!this.stage) {
        this.stage = new Konva.Stage({
          container: host,
          width,
          height,
        });

        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
      } else {
        this.stage.size({ width, height });
      }

      this.stage.on('mousemove touchmove', () => {
        if (this.pinnedId) {
          return;
        }

        const pointer = this.stage?.getPointerPosition();

        if (pointer) {
          this.pointerX = pointer.x;
          this.pointerY = pointer.y;
        }
      });

      const layer = this.layer!;

      layer.destroyChildren();

      layer.add(
        new Konva.Image({
          image,
          x: 0,
          y: 0,
          width,
          height,
          listening: false,
        }),
      );

      for (const shape of this.regions) {
        const points = shape.points.flatMap((point) => [
          point.x * width,
          point.y * height,
        ]);

        const polygon = new Konva.Line({
          points,
          closed: true,
          fill: 'rgba(59, 130, 246, 0.06)',
          stroke: 'rgba(255, 255, 255, 0.01)',
          strokeWidth: 1,
          hitStrokeWidth: 8,
          name: shape.label,
          listening: true,
        });

        polygon.on('mouseenter', () => {
          this.hoveredId = shape.label;

          if (this.pinnedId !== shape.label) {
            polygon.fill('rgba(59, 130, 246, 0.28)');

            polygon.stroke('rgba(255, 255, 255, 0.9)');
          }

          layer.batchDraw();
        });

        polygon.on('mouseleave', () => {
          this.hoveredId = null;

          if (this.pinnedId !== shape.label) {
            polygon.fill('rgba(59, 130, 246, 0.06)');

            polygon.stroke('rgba(255, 255, 255, 0.01)');
          }

          layer.batchDraw();
        });

        polygon.on('click tap', () => {
          const pointer = this.stage?.getPointerPosition();

          if (pointer) {
            this.pointerX = pointer.x;
            this.pointerY = pointer.y;
          }

          this.pinnedId = this.pinnedId === shape.label ? null : shape.label;

          this.updatePolygonStyles();
        });

        layer.add(polygon);
      }

      layer.batchDraw();
    };

    render();

    this.resizeObserver = new ResizeObserver(render);
    this.resizeObserver.observe(host);
  }

  private updatePolygonStyles(): void {
    this.layer?.find('Line').forEach((node) => {
      const polygon = node as Konva.Line;
      const selected = polygon.name() === this.pinnedId;

      polygon.fill(
        selected ? 'rgba(59, 130, 246, 0.28)' : 'rgba(59, 130, 246, 0.06)',
      );

      polygon.stroke(
        selected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.01)',
      );
    });

    this.layer?.batchDraw();
  }

  closeModal(): void {
    this.pinnedId = null;
    this.updatePolygonStyles();
  }

  pointerX = 0;
  pointerY = 0;

  get tooltipPosition(): { left: number; top: number } {
    const stageWidth = this.stage?.width() ?? 0;
    const stageHeight = this.stage?.height() ?? 0;

    // Dimensões aproximadas do tooltip.
    const tooltipWidth = Math.min(320, stageWidth - 16);
    const tooltipHeight = 170;
    const gap = 18;
    const margin = 8;

    let left = this.pointerX + gap;
    let top = this.pointerY + gap;

    // Evita ultrapassar as bordas da imagem.
    if (left + tooltipWidth > stageWidth - margin) {
      left = this.pointerX - tooltipWidth - gap;
    }

    if (top + tooltipHeight > stageHeight - margin) {
      top = this.pointerY - tooltipHeight - gap;
    }

    return {
      left: Math.max(margin, left),
      top: Math.max(margin, top),
    };
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModal();
    this.hoveredId = null;
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.stage?.destroy();
  }
}
