'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    liquidGlass?: Shader;
  }
}

interface TextureResult {
  type: 't';
  x: number;
  y: number;
}

interface UV {
  x: number;
  y: number;
}

interface MousePos {
  x: number;
  y: number;
}

function smoothStep(a: number, b: number, t: number): number {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function roundedRectSDF(x: number, y: number, width: number, height: number, radius: number): number {
  const qx = Math.abs(x) - width + radius;
  const qy = Math.abs(y) - height + radius;
  return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
}

function texture(x: number, y: number): TextureResult {
  return { type: 't', x, y };
}

function generateId(): string {
  return 'liquid-glass-' + Math.random().toString(36).substr(2, 9);
}

interface ShaderOptions {
  width?: number;
  height?: number;
  fragment?: (uv: UV, mouse: MousePos) => TextureResult;
}

class Shader {
  width: number;
  height: number;
  fragment: (uv: UV, mouse: MousePos) => TextureResult;
  canvasDPI: number;
  id: string;
  offset: number;
  mouse: MousePos;
  mouseUsed: boolean;
  container!: HTMLDivElement;
  svg!: SVGSVGElement;
  feImage!: SVGFEImageElement;
  feDisplacementMap!: SVGFEDisplacementMapElement;
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  private cleanupFn?: () => void;

  constructor(options: ShaderOptions = {}) {
    this.width = options.width || 100;
    this.height = options.height || 100;
    this.fragment = options.fragment || ((uv) => texture(uv.x, uv.y));
    this.canvasDPI = 1;
    this.id = generateId();
    this.offset = 10;
    this.mouse = { x: 0, y: 0 };
    this.mouseUsed = false;

    this.createElement();
    this.setupEventListeners();
    this.updateShader();
  }

  createElement() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: ${this.width}px;
      height: ${this.height}px;
      overflow: hidden;
      border-radius: 150px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 -10px 25px inset rgba(0, 0, 0, 0.15);
      cursor: none;
      backdrop-filter: url(#${this.id}_filter) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1);
      -webkit-backdrop-filter: url(#${this.id}_filter) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1);
      z-index: 9999;
      pointer-events: none;
      border: 1px solid rgba(255, 255, 255, 0.08);
      will-change: transform;
    `;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this.svg.setAttribute('width', '0');
    this.svg.setAttribute('height', '0');
    this.svg.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9998;
    `;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', `${this.id}_filter`);
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('colorInterpolationFilters', 'sRGB');
    filter.setAttribute('x', '0');
    filter.setAttribute('y', '0');
    filter.setAttribute('width', this.width.toString());
    filter.setAttribute('height', this.height.toString());

    this.feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage');
    this.feImage.setAttribute('id', `${this.id}_map`);
    this.feImage.setAttribute('width', this.width.toString());
    this.feImage.setAttribute('height', this.height.toString());

    this.feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
    this.feDisplacementMap.setAttribute('in', 'SourceGraphic');
    this.feDisplacementMap.setAttribute('in2', `${this.id}_map`);
    this.feDisplacementMap.setAttribute('xChannelSelector', 'R');
    this.feDisplacementMap.setAttribute('yChannelSelector', 'G');

    filter.appendChild(this.feImage);
    filter.appendChild(this.feDisplacementMap);
    defs.appendChild(filter);
    this.svg.appendChild(defs);

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width * this.canvasDPI;
    this.canvas.height = this.height * this.canvasDPI;
    this.canvas.style.display = 'none';

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.context = ctx;
  }

  constrainPosition(x: number, y: number) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minX = this.offset;
    const maxX = viewportWidth - this.width - this.offset;
    const minY = this.offset;
    const maxY = viewportHeight - this.height - this.offset;
    const constrainedX = Math.max(minX, Math.min(maxX, x));
    const constrainedY = Math.max(minY, Math.min(maxY, y));
    return { x: constrainedX, y: constrainedY };
  }

  setupEventListeners() {
    // Position glass centered on mouse, constrained to viewport
    const updatePosition = (mouseX: number, mouseY: number) => {
      const targetX = mouseX - this.width / 2;
      const targetY = mouseY - this.height / 2;
      const constrained = this.constrainPosition(targetX, targetY);
      this.container.style.transform = `translate(${constrained.x}px, ${constrained.y}px)`;

      // Update mouse UV for shader
      this.mouse.x = (mouseX - constrained.x) / this.width;
      this.mouse.y = (mouseY - constrained.y) / this.height;

      if (this.mouseUsed) {
        this.updateShader();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    const handleResize = () => {
      // Re-constrain if viewport shrinks
      const rect = this.container.getBoundingClientRect();
      const constrained = this.constrainPosition(rect.left, rect.top);
      if (rect.left !== constrained.x || rect.top !== constrained.y) {
        this.container.style.transform = `translate(${constrained.x}px, ${constrained.y}px)`;
      }
    };

    // Initialize at center of viewport
    updatePosition(window.innerWidth / 2, window.innerHeight / 2);

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    this.cleanupFn = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }

  updateShader() {
    const mouseProxy = new Proxy(this.mouse, {
      get: (target, prop: string | symbol) => {
        this.mouseUsed = true;
        return target[prop as keyof MousePos];
      }
    });

    this.mouseUsed = false;

    const w = this.width * this.canvasDPI;
    const h = this.height * this.canvasDPI;
    const data = new Uint8ClampedArray(w * h * 4);

    let maxScale = 0;
    const rawValues: number[] = [];

    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % w;
      const y = Math.floor(i / 4 / w);
      const pos = this.fragment(
        { x: x / w, y: y / h },
        mouseProxy
      );
      const dx = pos.x * w - x;
      const dy = pos.y * h - y;
      maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
      rawValues.push(dx, dy);
    }

    maxScale *= 0.5;

    let index = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = rawValues[index++] / maxScale + 0.5;
      const g = rawValues[index++] / maxScale + 0.5;
      data[i] = r * 255;
      data[i + 1] = g * 255;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    this.context.putImageData(new ImageData(data, w, h), 0, 0);
    this.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.canvas.toDataURL());
    this.feDisplacementMap.setAttribute('scale', (maxScale / this.canvasDPI).toString());
  }

  appendTo(parent: HTMLElement) {
    parent.appendChild(this.svg);
    parent.appendChild(this.container);
  }

  destroy() {
    if (this.cleanupFn) this.cleanupFn();
    this.svg.remove();
    this.container.remove();
    this.canvas.remove();
  }
}

export default function LiquidGlassOverlay() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (typeof window === 'undefined') return;

    if (window.liquidGlass) {
      window.liquidGlass.destroy();
    }

    const shader = new Shader({
      width: 200,
      height: 140,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      fragment: (uv, _mouse) => {
        const ix = uv.x - 0.5;
        const iy = uv.y - 0.5;
        const distanceToEdge = roundedRectSDF(
          ix,
          iy,
          0.3,
          0.2,
          0.6
        );
        const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
        const scaled = smoothStep(0, 1, displacement);
        return texture(ix * scaled + 0.5, iy * scaled + 0.5);
      }
    });

    shader.appendTo(document.body);
    window.liquidGlass = shader;

    return () => {
      shader.destroy();
      delete window.liquidGlass;
    };
  }, []);

  return null;
}
