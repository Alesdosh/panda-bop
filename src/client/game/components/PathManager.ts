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

  drawPath(graphics: Phaser.GameObjects.Graphics): void {
    if (!graphics || this.pathPoints.length === 0) return;

    graphics.clear();
    graphics.lineStyle(4, 0x666666, 0.8);

    // Draw the curved path
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

    // Draw start and end indicators
    graphics.fillStyle(0x00ff00, 0.7);
    graphics.fillCircle(startPoint.x, startPoint.y, 8);

    const endPoint = this.pathPoints[this.pathPoints.length - 1];
    if (endPoint) {
      graphics.fillStyle(0xff0000, 0.7);
      graphics.fillCircle(endPoint.x, endPoint.y, 8);
    }
  }

  drawProgressPath(graphics: Phaser.GameObjects.Graphics, progress: number): void {
    if (!graphics || this.pathPoints.length === 0) return;

    graphics.clear();

    if (progress <= 0) return;

    // Draw the completed portion of the path in a different color
    graphics.lineStyle(6, 0x4a90e2, 0.8);

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
