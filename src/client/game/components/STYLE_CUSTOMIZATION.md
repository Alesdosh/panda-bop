# Guía de Personalización de Estilos

## 🎨 Dónde Cambiar Cada Elemento Visual

### 1. **Círculo Azul Arrastrable**

**Archivo:** `src/client/game/components/DragButton.ts`
**Método:** `drawCircle()` (línea ~95)

```typescript
private drawCircle(): void {
  if (!this.circleGraphics) return;
  this.circleGraphics.clear();
  
  // 🔧 PERSONALIZABLE: Anillo exterior (brillo sutil)
  this.circleGraphics.lineStyle(4, 0x4a90e2, 0.15);  // grosor, color, opacidad
  this.circleGraphics.strokeCircle(0, 0, 22);         // radio del anillo exterior
  
  // 🔧 PERSONALIZABLE: Anillo medio (brillo visible)
  this.circleGraphics.lineStyle(3, 0x4a90e2, 0.3);   // grosor, color, opacidad
  this.circleGraphics.strokeCircle(0, 0, 18);         // radio del anillo medio
  
  // 🔧 PERSONALIZABLE: Círculo principal
  this.circleGraphics.fillStyle(0x5aa0f2);            // color del círculo
  this.circleGraphics.fillCircle(0, 0, 12);           // radio del círculo
  
  // 🔧 PERSONALIZABLE: Borde blanco
  this.circleGraphics.lineStyle(2, 0xffffff, 0.9);    // grosor, color, opacidad
  this.circleGraphics.strokeCircle(0, 0, 12);         // radio del borde
  
  // 🔧 PERSONALIZABLE: Punto de luz (efecto 3D)
  this.circleGraphics.fillStyle(0xffffff, 0.4);       // color, opacidad
  this.circleGraphics.fillCircle(-2, -2, 4);          // posición x, y, radio
}
```

**También en el mismo archivo, línea ~85:**
```typescript
// 🔧 PERSONALIZABLE: Tamaño del área interactiva
this.container.setSize(40, 40); // ancho, alto en píxeles
```

### 2. **Camino/Trayectoria**

**Archivo:** `src/client/game/components/PathManager.ts`
**Método:** `drawPath()` (línea ~335)

```typescript
drawPath(graphics: Phaser.GameObjects.Graphics): void {
  if (!graphics || this.pathPoints.length === 0) return;
  graphics.clear();
  
  // 🔧 PERSONALIZABLE: Fondo del camino (capa más ancha y oscura)
  graphics.lineStyle(8, 0x333333, 0.6);  // grosor, color, opacidad
  this.drawPathLine(graphics);
  
  // 🔧 PERSONALIZABLE: Camino principal (capa media)
  graphics.lineStyle(5, 0xaaaaaa, 0.9);  // grosor, color, opacidad
  this.drawPathLine(graphics);
  
  // 🔧 PERSONALIZABLE: Línea guía central (capa más fina y brillante)
  graphics.lineStyle(2, 0xffffff, 0.8);  // grosor, color, opacidad
  this.drawPathLine(graphics);
}
```

### 3. **Indicadores de Inicio y Final**

**En el mismo método `drawPath()` del PathManager:**

```typescript
// 🔧 PERSONALIZABLE: Indicador de INICIO (verde)
const startPoint = this.pathPoints[0];
if (startPoint) {
  // Círculo verde principal
  graphics.fillStyle(0x00ff00, 0.9);           // color verde, opacidad
  graphics.fillCircle(startPoint.x, startPoint.y, 12);  // radio del círculo
  
  // Borde blanco
  graphics.lineStyle(2, 0xffffff);             // grosor, color del borde
  graphics.strokeCircle(startPoint.x, startPoint.y, 12); // radio del borde
  
  // Punto central blanco
  graphics.fillStyle(0xffffff);                // color del punto central
  graphics.fillCircle(startPoint.x, startPoint.y, 4);   // radio del punto
}

// 🔧 PERSONALIZABLE: Indicador de FINAL (rojo)
const endPoint = this.pathPoints[this.pathPoints.length - 1];
if (endPoint) {
  // Círculo rojo principal
  graphics.fillStyle(0xff0000, 0.9);           // color rojo, opacidad
  graphics.fillCircle(endPoint.x, endPoint.y, 12);      // radio del círculo
  
  // Borde blanco
  graphics.lineStyle(2, 0xffffff);             // grosor, color del borde
  graphics.strokeCircle(endPoint.x, endPoint.y, 12);    // radio del borde
  
  // Punto central blanco
  graphics.fillStyle(0xffffff);                // color del punto central
  graphics.fillCircle(endPoint.x, endPoint.y, 4);       // radio del punto
}
```

### 4. **Progreso Completado**

**Archivo:** `src/client/game/components/PathManager.ts`
**Método:** `drawProgressPath()` (línea ~397)

```typescript
drawProgressPath(graphics: Phaser.GameObjects.Graphics, progress: number): void {
  if (!graphics || this.pathPoints.length === 0) return;
  graphics.clear();
  if (progress <= 0) return;

  // 🔧 PERSONALIZABLE: Fondo del progreso (más ancho, sutil)
  graphics.lineStyle(10, 0x4a90e2, 0.3);  // grosor, color azul, opacidad
  this.drawProgressLine(graphics, progress);

  // 🔧 PERSONALIZABLE: Línea principal del progreso
  graphics.lineStyle(6, 0x4a90e2, 0.9);   // grosor, color azul, opacidad
  this.drawProgressLine(graphics, progress);

  // 🔧 PERSONALIZABLE: Línea central del progreso (brillante)
  graphics.lineStyle(2, 0xffffff, 0.8);   // grosor, color blanco, opacidad
  this.drawProgressLine(graphics, progress);
}
```

### 5. **Configuración de Comportamiento**

**Archivo:** `src/client/game/scenes/Game.ts`
**Método:** `initializeDragButtonManager()` (línea ~55)

```typescript
private initializeDragButtonManager(): void {
  this.dragButtonManager = new DragButtonManager(this, {
    defaultButtonConfig: {
      tolerance: 40,              // 🔧 Distancia permitida del camino (píxeles)
      maxBackwardMovement: 0.02,  // 🔧 Movimiento hacia atrás permitido (0-1)
      failureTimeoutMs: 200,      // 🔧 Tiempo antes de fallar (milisegundos)
    },
    defaultAutoRecreate: true,    // 🔧 Recrear automáticamente tras fallar
    defaultRecreateDelay: 1500,   // 🔧 Tiempo antes de recrear (milisegundos)
  });
}
```

## 🎨 Ejemplos de Personalización

### Ejemplo 1: Círculo Rojo con Brillo Dorado
```typescript
// En DragButton.ts, método drawCircle()
this.circleGraphics.lineStyle(4, 0xffd700, 0.15);  // Brillo dorado
this.circleGraphics.strokeCircle(0, 0, 22);
this.circleGraphics.fillStyle(0xff4444);            // Círculo rojo
this.circleGraphics.fillCircle(0, 0, 12);
```

### Ejemplo 2: Camino Verde Neón
```typescript
// En PathManager.ts, método drawPath()
graphics.lineStyle(8, 0x001100, 0.8);   // Fondo verde oscuro
this.drawPathLine(graphics);
graphics.lineStyle(5, 0x00ff00, 0.9);   // Verde brillante
this.drawPathLine(graphics);
graphics.lineStyle(2, 0x88ff88, 1.0);   // Verde claro central
this.drawPathLine(graphics);
```

### Ejemplo 3: Indicadores Personalizados
```typescript
// En PathManager.ts, método drawPath()
// Inicio: Estrella azul
graphics.fillStyle(0x0088ff, 0.9);
graphics.fillCircle(startPoint.x, startPoint.y, 15);  // Más grande

// Final: Diamante púrpura
graphics.fillStyle(0x8800ff, 0.9);
graphics.fillCircle(endPoint.x, endPoint.y, 15);
```

### Ejemplo 4: Progreso Arcoíris
```typescript
// En PathManager.ts, método drawProgressPath()
// Cambiar color según el progreso
const hue = progress * 120; // De rojo (0) a verde (120)
const color = Phaser.Display.Color.HSVToRGB(hue / 360, 1, 1);
const hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

graphics.lineStyle(6, hexColor, 0.9);
this.drawProgressLine(graphics, progress);
```

## 🔧 Configuración Rápida por Dificultad

### Fácil (Muy Visible)
```typescript
// Camino más ancho y brillante
graphics.lineStyle(12, 0xffffff, 1.0);  // Muy ancho y blanco
// Tolerancia alta
tolerance: 80,
```

### Normal (Balanceado)
```typescript
// Configuración actual
graphics.lineStyle(5, 0xaaaaaa, 0.9);
tolerance: 40,
```

### Difícil (Sutil)
```typescript
// Camino más fino y tenue
graphics.lineStyle(3, 0x666666, 0.6);  // Más fino y gris
// Tolerancia baja
tolerance: 20,
```

## 📍 Colores Hexadecimales Comunes

```typescript
// Azules
0x4a90e2  // Azul estándar
0x0088ff  // Azul brillante
0x1e3a8a  // Azul oscuro

// Verdes
0x00ff00  // Verde puro
0x22c55e  // Verde moderno
0x16a34a  // Verde oscuro

// Rojos
0xff0000  // Rojo puro
0xef4444  // Rojo moderno
0xdc2626  // Rojo oscuro

// Otros
0xffffff  // Blanco
0x000000  // Negro
0xffd700  // Dorado
0xff00ff  // Magenta
0x00ffff  // Cian
```

¡Con esta guía puedes personalizar completamente el aspecto visual del sistema!
