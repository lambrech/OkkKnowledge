import { Component, inject, input, OnInit, OnChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-map-display',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="map-wrapper">
      <div #mapContainer class="map-container"
           (pointerdown)="onPointerDown($event)"
           (pointermove)="onPointerMove($event)"
           (pointerup)="onPointerUp($event)"
           (pointercancel)="onPointerUp($event)"
           (wheel)="onWheel($event)">
      </div>
      <div class="map-controls">
        <button mat-mini-fab (click)="zoomIn()" aria-label="Zoom in"><mat-icon>add</mat-icon></button>
        <button mat-mini-fab (click)="zoomOut()" aria-label="Zoom out"><mat-icon>remove</mat-icon></button>
        <button mat-mini-fab (click)="resetView()" aria-label="Reset view"><mat-icon>center_focus_strong</mat-icon></button>
      </div>
    </div>
  `,
  styles: [`
    .map-wrapper {
      position: relative;
      width: 100%;
      max-width: 600px;
      margin: 0 auto 16px;
    }
    .map-container {
      width: 100%;
      aspect-ratio: 2 / 1;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f5f5;
      border: 1px solid rgba(0, 0, 0, 0.12);
      touch-action: none;
      cursor: grab;
      user-select: none;
    }
    .map-container:active { cursor: grabbing; }
    :deep(svg) { width: 100%; height: 100%; display: block; }
    .map-controls {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .map-controls button {
      width: 32px;
      height: 32px;
      opacity: 0.85;
    }
    .map-controls button mat-icon { font-size: 18px; width: 18px; height: 18px; }
    :host-context(body.dark-theme) .map-container {
      background: #2a2a2a;
      border-color: rgba(255, 255, 255, 0.12);
    }
  `]
})
export class MapDisplayComponent implements OnInit, OnChanges, AfterViewInit {
  countryCode = input.required<string>();
  @ViewChild('mapContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  private static svgCache: string | null = null;
  private http = inject(HttpClient);

  // ViewBox state
  private vbX = 0;
  private vbY = 0;
  private vbW = 1000;
  private vbH = 500;
  private svgEl: SVGSVGElement | null = null;

  // Initial focused viewBox (for reset)
  private initVbX = 0;
  private initVbY = 0;
  private initVbW = 1000;
  private initVbH = 500;

  // Pointer tracking for pan/pinch
  private pointers: Map<number, { x: number; y: number }> = new Map();
  private lastPanX = 0;
  private lastPanY = 0;
  private lastPinchDist = 0;

  ngOnInit(): void {
    this.loadAndRender();
  }

  ngOnChanges(): void {
    if (MapDisplayComponent.svgCache) {
      this.render(MapDisplayComponent.svgCache);
    }
  }

  ngAfterViewInit(): void {
    // getBBox needs the SVG in DOM; handled by render() with rAF
  }

  private loadAndRender(): void {
    if (MapDisplayComponent.svgCache) {
      this.render(MapDisplayComponent.svgCache);
      return;
    }
    this.http.get('assets/maps/world.svg', { responseType: 'text' }).subscribe(svg => {
      MapDisplayComponent.svgCache = svg;
      this.render(svg);
    });
  }

  private render(svgText: string): void {
    const container = this.containerRef.nativeElement;
    const code = this.countryCode().toLowerCase();

    // Parse SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svg = doc.documentElement as unknown as SVGSVGElement;

    // Check dark theme
    const isDark = document.body.classList.contains('dark-theme');
    const defaultFill = isDark ? '#424242' : '#e0e0e0';
    const defaultStroke = isDark ? '#333' : '#fff';
    const highlightFill = isDark ? '#ff7043' : '#ff5722';
    const highlightStroke = isDark ? '#ff5722' : '#d84315';
    const bgFill = isDark ? '#2a2a2a' : '#f5f5f5';

    // Apply styles directly
    const paths = svg.querySelectorAll('.country');
    paths.forEach((path: Element) => {
      const el = path as SVGElement;
      el.setAttribute('fill', defaultFill);
      el.setAttribute('stroke', defaultStroke);
      el.setAttribute('stroke-width', '0.5');
    });

    // Highlight target country
    const target = svg.querySelector(`#${code}`) as SVGElement | null;
    if (target) {
      target.setAttribute('fill', highlightFill);
      target.setAttribute('stroke', highlightStroke);
      target.setAttribute('stroke-width', '1.5');
    }

    // Set background rect
    const bgRect = svg.querySelector('rect');
    if (bgRect) bgRect.setAttribute('fill', bgFill);

    // Remove the internal <style>
    const style = svg.querySelector('style');
    if (style) style.remove();

    // Insert SVG into container
    container.innerHTML = '';
    container.appendChild(svg);
    this.svgEl = svg;

    // Auto-center on highlighted country after render
    requestAnimationFrame(() => {
      this.autoCenter(target);
    });
  }

  private autoCenter(target: SVGElement | null): void {
    if (!target || !this.svgEl) {
      this.vbX = 0; this.vbY = 0; this.vbW = 1000; this.vbH = 500;
      this.updateViewBox();
      return;
    }

    try {
      const bbox = (target as unknown as SVGGraphicsElement).getBBox();
      const padding = Math.max(bbox.width, bbox.height) * 0.7;
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;

      const minSize = 80;
      const w = Math.max(bbox.width + padding * 2, minSize * 2);
      const h = w / 2; // maintain 2:1 aspect ratio

      this.vbX = cx - w / 2;
      this.vbY = cy - h / 2;
      this.vbW = w;
      this.vbH = h;

      this.clampViewBox();

      this.initVbX = this.vbX;
      this.initVbY = this.vbY;
      this.initVbW = this.vbW;
      this.initVbH = this.vbH;

      this.updateViewBox();
    } catch {
      this.vbX = 0; this.vbY = 0; this.vbW = 1000; this.vbH = 500;
      this.updateViewBox();
    }
  }

  private updateViewBox(): void {
    if (this.svgEl) {
      this.svgEl.setAttribute('viewBox', `${this.vbX} ${this.vbY} ${this.vbW} ${this.vbH}`);
    }
  }

  private clampViewBox(): void {
    if (this.vbW > 1000) this.vbW = 1000;
    if (this.vbH > 500) this.vbH = 500;
    if (this.vbX < -50) this.vbX = -50;
    if (this.vbY < -50) this.vbY = -50;
    if (this.vbX + this.vbW > 1050) this.vbX = 1050 - this.vbW;
    if (this.vbY + this.vbH > 550) this.vbY = 550 - this.vbH;
  }

  onPointerDown(e: PointerEvent): void {
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    if (this.pointers.size === 1) {
      this.lastPanX = e.clientX;
      this.lastPanY = e.clientY;
    } else if (this.pointers.size === 2) {
      this.lastPinchDist = this.getPinchDist();
    }
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (this.pointers.size === 1) {
      const dx = e.clientX - this.lastPanX;
      const dy = e.clientY - this.lastPanY;
      this.lastPanX = e.clientX;
      this.lastPanY = e.clientY;

      const container = this.containerRef.nativeElement;
      const scale = this.vbW / container.clientWidth;
      this.vbX -= dx * scale;
      this.vbY -= dy * scale;
      this.clampViewBox();
      this.updateViewBox();
    } else if (this.pointers.size === 2) {
      const newDist = this.getPinchDist();
      if (this.lastPinchDist > 0 && newDist > 0) {
        const ratio = this.lastPinchDist / newDist;
        const cx = this.vbX + this.vbW / 2;
        const cy = this.vbY + this.vbH / 2;
        this.vbW *= ratio;
        this.vbH *= ratio;
        this.vbX = cx - this.vbW / 2;
        this.vbY = cy - this.vbH / 2;
        this.clampViewBox();
        this.updateViewBox();
      }
      this.lastPinchDist = newDist;
    }
  }

  onPointerUp(e: PointerEvent): void {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size < 2) this.lastPinchDist = 0;
    if (this.pointers.size === 1) {
      const remaining = this.pointers.values().next().value!;
      this.lastPanX = remaining.x;
      this.lastPanY = remaining.y;
    }
  }

  onWheel(e: WheelEvent): void {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 0.87;
    const cx = this.vbX + this.vbW / 2;
    const cy = this.vbY + this.vbH / 2;
    this.vbW *= factor;
    this.vbH *= factor;
    this.vbX = cx - this.vbW / 2;
    this.vbY = cy - this.vbH / 2;
    this.clampViewBox();
    this.updateViewBox();
  }

  private getPinchDist(): number {
    const pts = [...this.pointers.values()];
    if (pts.length < 2) return 0;
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  zoomIn(): void {
    const cx = this.vbX + this.vbW / 2;
    const cy = this.vbY + this.vbH / 2;
    this.vbW *= 0.7;
    this.vbH *= 0.7;
    this.vbX = cx - this.vbW / 2;
    this.vbY = cy - this.vbH / 2;
    this.clampViewBox();
    this.updateViewBox();
  }

  zoomOut(): void {
    const cx = this.vbX + this.vbW / 2;
    const cy = this.vbY + this.vbH / 2;
    this.vbW *= 1.4;
    this.vbH *= 1.4;
    this.vbX = cx - this.vbW / 2;
    this.vbY = cy - this.vbH / 2;
    this.clampViewBox();
    this.updateViewBox();
  }

  resetView(): void {
    this.vbX = this.initVbX;
    this.vbY = this.initVbY;
    this.vbW = this.initVbW;
    this.vbH = this.initVbH;
    this.updateViewBox();
  }
}
