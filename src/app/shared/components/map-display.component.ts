import { Component, inject, input, signal, OnInit, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-map-display',
  standalone: true,
  template: `<div class="map-container" [innerHTML]="mapHtml()"></div>`,
  styles: [`
    .map-container {
      width: 100%;
      max-width: 500px;
      margin: 0 auto 16px;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f5f5;
      border: 1px solid rgba(0, 0, 0, 0.12);
    }
    .map-container :deep(svg) {
      width: 100%;
      height: auto;
      display: block;
    }
    :host-context(body.dark-theme) .map-container {
      background: #2a2a2a;
      border-color: rgba(255, 255, 255, 0.12);
    }
  `]
})
export class MapDisplayComponent implements OnInit, OnChanges {
  countryCode = input.required<string>();
  mapHtml = signal<SafeHtml>('');

  private static svgCache: string | null = null;
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    this.loadAndRender();
  }

  ngOnChanges(): void {
    if (MapDisplayComponent.svgCache) {
      this.render(MapDisplayComponent.svgCache);
    }
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

  private render(svg: string): void {
    const code = this.countryCode().toLowerCase();
    const highlightStyle = `<style>.country{fill:#e0e0e0;stroke:#fff;stroke-width:0.5;transition:fill 0.2s}#${code}{fill:#ff5722;stroke:#d84315;stroke-width:1.5}</style>`;
    const darkStyle = `@media(prefers-color-scheme:dark){.country{fill:#424242;stroke:#333}#${code}{fill:#ff7043;stroke:#ff5722}}`;
    const fullStyle = highlightStyle.replace('</style>', darkStyle + '</style>');
    const modified = svg.replace(/<style>[\s\S]*?<\/style>/, fullStyle);
    this.mapHtml.set(this.sanitizer.bypassSecurityTrustHtml(modified));
  }
}
