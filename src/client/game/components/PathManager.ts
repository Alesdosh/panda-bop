import * as Phaser from 'phaser';

export enum PathType {
  CURVED_UP = 'curved_up',
  CURVED_DOWN = 'curved_down',
  SPIRAL = 'spiral',
  ZIGZAG = 'zigzag',
  CIRCLE = 'circle',
  STRAIGHT_LINE = 'straight_line',
  S_CURVE = 's_curve',
  HEART = 'heart'
}

export interface PathConfig {
  type: PathType | undefined;
  size: number;
  rotation?: number;
  offsetX?: number;
  offsetY?: number;
}

export class PathManager {
  private pathPoints: Phaser.Math.Vector2[] = [];
  private pathSegmentLengths: number[] = [];
  private pathSegmentStarts: number[] = [];
  private totalPathLength: number = 0;

  constructor() {}

  createPath(centerX: number, centerY: number, scaleFactor: number = 1, config?: PathConfig): void {
    const pathConfig = config || { type: PathType.CURVED_UP, size: 100 };
    
    this.pathPoints = this.generatePathPoints(
      centerX, 
      centerY, 
      scaleFactor, 
      pathConfig
    );

    this.calculatePathLengths();
  }

  private generatePathPoints(
    centerX: number, 
    centerY: number, 
    scaleFactor: number, 
    config: PathConfig
  ): Phaser.Math.Vector2[] {
    const size = config.size * scaleFactor;
    const offsetX = (config.offsetX || 0) * scaleFactor;
    const offsetY = (config.offsetY || 0) * scaleFactor;
    const rotation = config.rotation || 0;

    let points: Phaser.Math.Vector2[] = [];

    switch (config.type) {
      case PathType.CURVED_UP:
        points = this.createCurvedUpPath(centerX + offsetX, centerY + offsetY, size);
        break;
      case PathType.CURVED_DOWN:
        points = this.createCurvedDownPath(centerX + offsetX, centerY + offsetY, size);
        break;
      case PathType.SPIRAL:
        points = this.createSpiralPath(centerX + offsetX, centerY + offsetY, size);
        break;
      case PathType.ZIGZAG:
        points = this.createZigzagPath(centerX + offsetX, centerY + offsetY, size);
        break;
      case PathType.CIRCLE:
        points = this.createCirclePath(centerX + offsetX, centerY + offsetY, size);
        break;
      case PathType.STRAIGHT_LINE:
        points = this.createStraightLinePath(centerX + offsetX, centerY + offsetY, size);
        break;
      case PathType.S_CURVE:
        points = this.createSCurvePath(centerX + offsetX, centerY + offsetY, size);
        break;
      case PathType.HEART:
        points = this.createHeartPath(centerX + offsetX, centerY + offsetY, size);
        break;
      default:
        points = this.createCurvedUpPath(centerX + offsetX, centerY + offsetY, size);
        break;
    }

    // Apply rotation if specified
    if (rotation !== 0) {
      points = this.rotatePoints(points, centerX + offsetX, centerY + offsetY, rotation);
    }

    return points;
  }

  private createCurvedUpPath(centerX: number, centerY: number, size: number): Phaser.Math.Vector2[] {
    return [
      new Phaser.Math.Vector2(centerX - size, centerY + size),
      new Phaser.Math.Vector2(centerX - size * 0.8, centerY + size * 0.6),
      new Phaser.Math.Vector2(centerX - size * 0.4, centerY + size * 0.2),
      new Phaser.Math.Vector2(centerX, centerY - size * 0.2),
      new Phaser.Math.Vector2(centerX + size * 0.4, centerY - size * 0.6),
      new Phaser.Math.Vector2(centerX + size * 0.8, centerY - size),
      new Phaser.Math.Vector2(centerX + size, centerY - size * 1.4),
    ];
  }

  private createCurvedDownPath(centerX: number, centerY: number, size: number): Phaser.Math.Vector2[] {
    return [
      new Phaser.Math.Vector2(centerX - size, centerY - size),
      new Phaser.Math.Vector2(centerX - size * 0.8, centerY - size * 0.6),
      new Phaser.Math.Vector2(centerX - size * 0.4, centerY - size * 0.2),
      new Phaser.Math.Vector2(centerX, centerY + size * 0.2),
      new Phaser.Math.Vector2(centerX + size * 0.4, centerY + size * 0.6),
      new Phaser.Math.Vector2(centerX + size * 0.8, centerY + size),
      new Phaser.Math.Vector2(centerX + size, centerY + size * 1.4),
    ];
  }

  private createSpiralPath(centerX: number, centerY: number, size: number): Phaser.Math.Vector2[] {
    const points: Phaser.Math.Vector2[] = [];
    const turns = 2;
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * turns * Math.PI * 2;
      const radius = (i / steps) * size;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      points.push(new Phaser.Math.Vector2(x, y));
    }
    
    return points;
  }

  private createZigzagPath(centerX: number, centerY: number, size: number): Phaser.Math.Vector2[] {
    const points: Phaser.Math.Vector2[] = [];
    const segments = 6;
    
    for (let i = 0; i <= segments; i++) {
      const x = centerX + (i / segments - 0.5) * size * 2;
      const y = centerY + (i % 2 === 0 ? -size * 0.5 : size * 0.5);
      points.push(new Phaser.Math.Vector2(x, y));
    }
    
    return points;
  }

  private createCirclePath(centerX: number, centerY: number, size: number): Phaser.Math.Vector2[] {
    const points: Phaser.Math.Vector2[] = [];
    const steps = 16;
    
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * size;
      const y = centerY + Math.sin(angle) * size;
      points.push(new Phaser.Math.Vector2(x, y));
    }
    
    return points;
  }

  private createStraightLinePath(centerX: number, centerY: number, size: number): Phaser.Math.Vector2[] {
    return [
      new Phaser.Math.Vector2(centerX - size, centerY),
      new Phaser.Math.Vector2(centerX + size, centerY),
    ];
  }

  private createSCurvePath(centerX: number, centerY: number, size: number): Phaser.Math.Vector2[] {
    return [
      new Phaser.Math.Vector2(centerX - size, centerY + size),
      new Phaser.Math.Vector2(centerX - size * 0.5, centerY + size * 0.5),
      new Phaser.Math.Vector2(centerX, centerY),
      new Phaser.Math.Vector2(centerX + size * 0.5, centerY - size * 0.5),
      new Phaser.Math.Vector2(centerX + size, centerY - size),
    ];
  }

  private createHeartPath(centerX: number, centerY: number, size: number): Phaser.Math.Vector2[] {
    const points: Phaser.Math.Vector2[] = [];
    const steps = 30; // More steps for smoother heart
    
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      // Heart equation: x = 16sin³(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
      const heartX = 16 * Math.pow(Math.sin(t), 3);
      const heartY = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      
      // Scale and position the heart
      const scale = size / 16; // Scale based on the heart's natural size
      const x = centerX + heartX * scale;
      const y = centerY - heartY * scale; // Negative to flip Y axis (screen coordinates)
      
      points.push(new Phaser.Math.Vector2(x, y));
    }
    

    
    return points;
  }

  private rotatePoints(points: Phaser.Math.Vector2[], centerX: number, centerY: number, rotation: number): Phaser.Math.Vector2[] {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    
    return points.map(point => {
      const dx = point.x - centerX;
      const dy = point.y - centerY;
      
      return new Phaser.Math.Vector2(
        centerX + dx * cos - dy * sin,
        centerY + dx * sin + dy * cos
      );
    });
  }

  private calculatePathLengths(): void {
    this.pathSegmentLengths = [];
    this.pathSegmentStarts = [];
    this.totalPathLength = 0;

    for (let i = 0; i < this.pathPoints.length - 1; i++) {
      const point1 = this.pathPoints[i];
      const point2 = this.pathPoints[i + 1];

      if (point1 && point2) {
        const segmentLength = Phaser.Math.Distance.Between(point1.x, point1.y, point2.x, point2.y);
        this.pathSegmentLengths.push(segmentLength);
        this.pathSegmentStarts.push(this.totalPathLength);
        this.totalPathLength += segmentLength;
      }
    }
  }

  getPositionOnPath(progress: number): Phaser.Math.Vector2 {
    // Clamp progress between 0 and 1
    progress = Phaser.Math.Clamp(progress, 0, 1);

    const targetDistance = progress * this.totalPathLength;

    // Find which segment we're on
    for (let i = 0; i < this.pathSegmentStarts.length; i++) {
      const segmentStart = this.pathSegmentStarts[i];
      const segmentLength = this.pathSegmentLengths[i];

      if (
        segmentStart !== undefined &&
        segmentLength !== undefined &&
        targetDistance >= segmentStart &&
        targetDistance <= segmentStart + segmentLength
      ) {
        // We're on this segment
        const segmentProgress = (targetDistance - segmentStart) / segmentLength;
        const point1 = this.pathPoints[i];
        const point2 = this.pathPoints[i + 1];

        if (point1 && point2) {
          // Interpolate between the two points
          const x = Phaser.Math.Linear(point1.x, point2.x, segmentProgress);
          const y = Phaser.Math.Linear(point1.y, point2.y, segmentProgress);
          return new Phaser.Math.Vector2(x, y);
        }
      }
    }

    // Fallback to start or end point
    const fallbackPoint =
      progress < 0.5 ? this.pathPoints[0] : this.pathPoints[this.pathPoints.length - 1];
    return fallbackPoint || new Phaser.Math.Vector2(0, 0);
  }

  getProgressFromPosition(x: number, y: number): number {
    let closestProgress = 0;
    let closestDistance = Infinity;

    // Check multiple points along the path to find the closest one
    const samples = 100;
    for (let i = 0; i <= samples; i++) {
      const progress = i / samples;
      const pathPos = this.getPositionOnPath(progress);
      const distance = Phaser.Math.Distance.Between(x, y, pathPos.x, pathPos.y);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestProgress = progress;
      }
    }

    return closestProgress;
  }

  /**
   * Gets the next valid progress position that the user can move to
   * This enforces sequential movement along the path
   */
  getNextValidProgress(
    cursorX: number, 
    cursorY: number, 
    currentProgress: number, 
    maxAdvancement: number = 0.1,
    tolerance: number = 60
  ): number | null {
    // Define how far ahead we can look (as a percentage of total path)
    const maxLookAhead = Math.min(currentProgress + maxAdvancement, 1.0);
    
    // Sample points only in the valid range (current position to max look ahead)
    const samples = 50;
    let bestProgress = currentProgress;
    let bestDistance = Infinity;
    
    for (let i = 0; i <= samples; i++) {
      const progress = currentProgress + (i / samples) * (maxLookAhead - currentProgress);
      const pathPos = this.getPositionOnPath(progress);
      const distance = Phaser.Math.Distance.Between(cursorX, cursorY, pathPos.x, pathPos.y);
      
      // Only consider positions that are within tolerance and ahead of current position
      if (distance <= tolerance && progress > currentProgress && distance < bestDistance) {
        bestDistance = distance;
        bestProgress = progress;
      }
    }
    
    // Return the best progress if we found a valid position, otherwise null
    return bestProgress > currentProgress ? bestProgress : null;
  }

  /**
   * Checks if a position is close enough to a specific progress point on the path
   */
  isPositionOnPath(x: number, y: number, progress: number, tolerance: number = 60): boolean {
    const pathPosition = this.getPositionOnPath(progress);
    const distance = Phaser.Math.Distance.Between(x, y, pathPosition.x, pathPosition.y);
    return distance <= tolerance;
  }

  drawPath(graphics: Phaser.GameObjects.Graphics): void {
    if (!graphics || this.pathPoints.length === 0) return;

    graphics.clear();
    
    // Draw background path (wider, darker)
    graphics.lineStyle(8, 0x333333, 0.6);
    this.drawPathLine(graphics);
    
    // Draw main path (brighter, more visible)
    graphics.lineStyle(5, 0xaaaaaa, 0.9);
    this.drawPathLine(graphics);
    
    // Draw center guide line (thin, bright)
    graphics.lineStyle(2, 0xffffff, 0.8);
    this.drawPathLine(graphics);

    // Draw enhanced start and end indicators
    const startPoint = this.pathPoints[0];
    if (startPoint) {
      // Start indicator - green with border
      graphics.fillStyle(0x00ff00, 0.9);
      graphics.fillCircle(startPoint.x, startPoint.y, 12);
      graphics.lineStyle(2, 0xffffff);
      graphics.strokeCircle(startPoint.x, startPoint.y, 12);
      
      // Start label
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(startPoint.x, startPoint.y, 4);
    }

    const endPoint = this.pathPoints[this.pathPoints.length - 1];
    if (endPoint) {
      // End indicator - red with border
      graphics.fillStyle(0xff0000, 0.9);
      graphics.fillCircle(endPoint.x, endPoint.y, 12);
      graphics.lineStyle(2, 0xffffff);
      graphics.strokeCircle(endPoint.x, endPoint.y, 12);
      
      // End label
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(endPoint.x, endPoint.y, 4);
    }
  }

  private drawPathLine(graphics: Phaser.GameObjects.Graphics): void {
    const startPoint = this.pathPoints[0];
    if (!startPoint) return;

    graphics.beginPath();
    graphics.moveTo(startPoint.x, startPoint.y);

    for (let i = 1; i < this.pathPoints.length; i++) {
      const point = this.pathPoints[i];
      if (point) {
        graphics.lineTo(point.x, point.y);
      }
    }

    graphics.strokePath();
  }

  drawProgressPath(graphics: Phaser.GameObjects.Graphics, progress: number): void {
    if (!graphics || this.pathPoints.length === 0) return;

    graphics.clear();

    if (progress <= 0) return;

    const startPoint = this.pathPoints[0];
    if (!startPoint) return;

    // Draw background progress (wider)
    graphics.lineStyle(10, 0x4a90e2, 0.3);
    this.drawProgressLine(graphics, progress);

    // Draw main progress line (bright blue)
    graphics.lineStyle(6, 0x4a90e2, 0.9);
    this.drawProgressLine(graphics, progress);

    // Draw center progress line (bright white)
    graphics.lineStyle(2, 0xffffff, 0.8);
    this.drawProgressLine(graphics, progress);
  }

  private drawProgressLine(graphics: Phaser.GameObjects.Graphics, progress: number): void {
    const startPoint = this.pathPoints[0];
    if (!startPoint) return;

    graphics.beginPath();
    graphics.moveTo(startPoint.x, startPoint.y);

    // Draw path up to current progress
    const samples = 50;
    for (let i = 1; i <= samples; i++) {
      const currentProgress = (i / samples) * progress;
      const point = this.getPositionOnPath(currentProgress);
      graphics.lineTo(point.x, point.y);
    }

    graphics.strokePath();
  }

  getPathPoints(): Phaser.Math.Vector2[] {
    return this.pathPoints;
  }

  getStartPoint(): Phaser.Math.Vector2 | undefined {
    return this.pathPoints[0];
  }

  getEndPoint(): Phaser.Math.Vector2 | undefined {
    return this.pathPoints[this.pathPoints.length - 1];
  }
}
