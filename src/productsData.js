// Catálogo completo de productos de dtorreshaus
// Total: 119 productos organizados en 10 categorías
// Categorías activas: labubu, armas
// Categorías próximamente: cocina, baño, limpieza, organización, decoración, tecnología, bienestar, deportes

// Configuración de categorías (orden y estado)
export const categoryConfig = {
  labubu: {
    active: true,
    comingSoon: false,
    order: 1,
    label: 'Labubu',
    icon: '🎁'
  },
  armas: {
    active: true,
    comingSoon: false,
    order: 2,
    label: 'Gel Blasters',
    icon: '🔫'
  },
  cocina: {
    active: true,
    comingSoon: false,
    order: 3,
    label: 'Cocina',
    icon: '🍳'
  },
  baño: {
    active: true,
    comingSoon: false,
    order: 4,
    label: 'Baño',
    icon: '🛁'
  },
  limpieza: {
    active: true,
    comingSoon: false,
    order: 5,
    label: 'Limpieza',
    icon: '🧹'
  },
  organización: {
    active: true,
    comingSoon: false,
    order: 6,
    label: 'Organización',
    icon: '📦'
  },
  decoración: {
    active: true,
    comingSoon: false,
    order: 7,
    label: 'Decoración',
    icon: '💡'
  },
  tecnología: {
    active: true,
    comingSoon: false,
    order: 8,
    label: 'Tecnología',
    icon: '💻'
  },
  bienestar: {
    active: true,
    comingSoon: false,
    order: 9,
    label: 'Bienestar',
    icon: '🌱'
  },
  deportes: {
    active: true,
    comingSoon: false,
    order: 10,
    label: 'Deportes',
    icon: '⚽'
  }
}

export const productsData = {
  // ===================================
  // CATEGORÍAS ACTIVAS
  // ===================================

  labubu: [
    {
      sku: 'POP01',
      nombre: 'Labubu Caja Sorpresa (3ª Generación)',
      descripcion: 'Figura sorpresa de colección. Cada caja incluye un diseño aleatorio de Labubu. Ideal para regalar o coleccionar.',
      material: 'Vinilo + PVC – Diseño aleatorio',
      categoria: 'Labubu – Pop Mart',
      precio: 32900,
      emoji: '🎁',
      active: true
    },
    {
      sku: 'POP02',
      nombre: 'Labubu con Ropa (más de 1000 estilos)',
      descripcion: 'Figura Labubu con traje textil completo. Más de mil estilos únicos y edición coleccionable Pop Mart.',
      material: 'Peluche + Vinilo – +1000 estilos',
      categoria: 'Labubu – Pop Mart',
      precio: 32900,
      emoji: '👗',
      active: true
    },
    {
      sku: 'POP03',
      nombre: 'Labubu Monster (con Cadena Metálica)',
      descripcion: 'Edición especial del clásico Labubu con traje peludo y cadena metálica. Diseño premium y exclusivo.',
      material: 'Plush + Metal – Edición especial',
      categoria: 'Labubu – Pop Mart',
      precio: 49900,
      emoji: '🔗',
      active: true
    },
    {
      sku: 'POP04',
      nombre: 'Labubu Monster Tornasol (Iridiscente)',
      descripcion: 'Figura Labubu edición tornasol con acabado brillante y textura multicolor. Efecto iridiscente premium.',
      material: 'Plush iridiscente – Multicolor',
      categoria: 'Labubu – Pop Mart',
      precio: 34900,
      emoji: '✨',
      active: true
    },
    {
      sku: 'POP05',
      nombre: 'Gran Labubu (38 cm – Edición Gigante)',
      descripcion: 'Figura gigante de 38 cm con textura premium y ojos brillantes. La joya de la colección Pop Mart.',
      material: 'Plush premium – 38 cm',
      categoria: 'Labubu – Pop Mart',
      precio: 329900,
      emoji: '🦖',
      active: true
    }
  ],

  armas: [
    {
      sku: 'WPN-ARP9-01',
      nombre: 'ARP9 – Rifle táctico premium',
      descripcion: 'Nuestra arma más potente, con diseño realista, luz en la mira y alto rendimiento. Ideal para coleccionistas y entusiastas del gel blaster.',
      material: 'ABS táctico + Gel blaster eléctrico',
      categoria: 'Armas – Rifles Premium',
      precio: 220000,
      emoji: '🔫',
      active: true
    },
    {
      sku: 'WPN-AK47-BLK-01',
      nombre: 'AK47 Negra – Clásico con humo y luz',
      descripcion: 'Inspirada en el clásico diseño AK, cuenta con pila de litio, efectos de humo y luces LED. Potencia media y excelente agarre.',
      material: 'ABS + Pila litio – Luz y humo',
      categoria: 'Armas – Rifles Clásicos',
      precio: 110000,
      emoji: '💥',
      active: true
    },
    {
      sku: 'WPN-AK47-RED-01',
      nombre: 'AK47 Roja – Edición camuflada',
      descripcion: 'Versión roja camuflada de la AK47, con pila recargable y sistema de luces y humo. Ideal para uso recreativo.',
      material: 'ABS camuflado + Pila recargable',
      categoria: 'Armas – Rifles Clásicos',
      precio: 110000,
      emoji: '🔴',
      active: true
    },
    {
      sku: 'WPN-AK47-DBP-01',
      nombre: 'AK47 Doble Pila – Alta potencia',
      descripcion: 'Potente rifle de doble pila con efectos de luz y humo. Ideal para sesiones largas sin recargar.',
      material: 'ABS + Doble pila litio – Luz y humo',
      categoria: 'Armas – Rifles Clásicos',
      precio: 110000,
      emoji: '⚡',
      active: true
    },
    {
      sku: 'WPN-UMP7-01',
      nombre: 'UMP7 – Compacta de una pila',
      descripcion: 'Modelo compacto, ligero y fácil de usar. Ideal para principiantes.',
      material: 'ABS + Pila recargable',
      categoria: 'Armas – Compactas',
      precio: 60000,
      emoji: '🎯',
      active: true
    },
    {
      sku: 'WPN-UMP45-01',
      nombre: 'UMP45 – Potente y ligera',
      descripcion: 'Diseño moderno con pila de litio y alta potencia. Disparo estable y largo alcance.',
      material: 'ABS + Pila litio',
      categoria: 'Armas – Compactas',
      precio: 90000,
      emoji: '🔹',
      active: true
    },
    {
      sku: 'WPN-VECTOR-BLK-01',
      nombre: 'Vector Negra – Profesional con linterna',
      descripcion: 'Arma profesional con linterna integrada, efectos de humo y luz. Pila de litio de alta capacidad.',
      material: 'ABS táctico + Linterna LED',
      categoria: 'Armas – Profesionales',
      precio: 120000,
      emoji: '🔦',
      active: true
    },
    {
      sku: 'WPN-M4-01',
      nombre: 'M4 – Doble pila multicolor',
      descripcion: 'Rifle M4 con doble pila y diseño colorido. Ideal para uso prolongado y alto impacto visual.',
      material: 'ABS multicolor + Doble pila',
      categoria: 'Armas – Rifles M4',
      precio: 120000,
      emoji: '🌈',
      active: true
    },
    {
      sku: 'WPN-M416-SKULL-01',
      nombre: 'M416 Calavera – Diseño agresivo',
      descripcion: 'Versión calavera con luces LED y pila de litio. Excelente potencia y estética táctica.',
      material: 'ABS diseño calavera + Pila litio',
      categoria: 'Armas – Rifles M4',
      precio: 140000,
      emoji: '💀',
      active: true
    },
    {
      sku: 'WPN-M416-MIL-01',
      nombre: 'M416 Militar – Doble pila',
      descripcion: 'Modelo militar con doble pila recargable. Mide casi un metro. Ideal para colección.',
      material: 'ABS militar + Doble pila – 100 cm',
      categoria: 'Armas – Rifles M4',
      precio: 120000,
      emoji: '🪖',
      active: true
    },
    {
      sku: 'WPN-DBLCANNON-01',
      nombre: 'Doble Cañón – Bifocal con luz dual',
      descripcion: 'Rifle de doble cañón con luces en ambos extremos. Efecto visual impresionante.',
      material: 'ABS + Doble LED – Doble cañón',
      categoria: 'Armas – Especiales',
      precio: 180000,
      emoji: '🔥',
      active: true
    },
    {
      sku: 'WPN-SHOOT-ELITE-01',
      nombre: 'Shooting Elite – Compacta doble pila',
      descripcion: 'Arma compacta con doble pila, ideal para principiantes. Gran potencia para su tamaño.',
      material: 'ABS compacto + Doble pila',
      categoria: 'Armas – Compactas',
      precio: 75000,
      emoji: '🎮',
      active: true
    }
  ],

  // ===================================
  // PRÓXIMAMENTE
  // ===================================

  cocina: [
    // Botellas y dispensadores
    {
      sku: 'JAC01-5',
      nombre: 'Dispensador de vidrio con bomba cromada – 200 ml',
      descripcion: 'Dispensador de vidrio transparente con tapa metálica cromada y bomba dosificadora.',
      material: 'Vidrio / Acero inox. – 200 ml – 14.5 × 6 cm',
      categoria: 'Cocina – Accesorios',
      precio: 11000,
      emoji: '🧴'
    },
    {
      sku: 'JAC01-6',
      nombre: 'Botella térmica de vidrio con tapa metálica – 500 ml',
      descripcion: 'Botella de vidrio transparente con tapa de acero y recubrimiento exterior de colores surtidos.',
      material: 'Vidrio / Acero inox. – 500 ml – 17 cm alto',
      categoria: 'Cocina – Hidratación',
      precio: 14500,
      emoji: '🍶'
    },
    {
      sku: 'JAC01-7',
      nombre: 'Dispensador de aceite o vinagre – 200 ml',
      descripcion: 'Botella dispensadora de vidrio con pico vertedor metálico. Ideal para aceite de oliva o vinagre.',
      material: 'Vidrio / Acero inox. – 200 ml – 17 × 4 cm',
      categoria: 'Cocina – Utensilios',
      precio: 15900,
      emoji: '🫒'
    },
    {
      sku: 'JAC01-8',
      nombre: 'Pulverizador de aceite – 220 ml (blanco / negro)',
      descripcion: 'Atomizador recargable de cocina para aceite o vinagre, con boquilla de pulverización fina.',
      material: 'Plástico PET / Acero – 220 ml – 20 × 5.5 cm',
      categoria: 'Cocina – Utensilios',
      precio: 14000,
      emoji: '💦'
    },
    // Mugs y tazas
    {
      sku: 'JAC01-9',
      nombre: 'Mug cerámico con diseño floral surtido – 260 ml',
      descripcion: 'Taza de cerámica decorada, disponible en 4 diseños florales. Ideal para café o té.',
      material: 'Cerámica – Ø 7.6 × 8 cm',
      categoria: 'Cocina – Vajilla',
      precio: 9900,
      emoji: '🌺'
    },
    {
      sku: 'JAC01-10',
      nombre: 'Mug cerámico con puntos de colores – 230 ml',
      descripcion: 'Taza colorida con puntos blancos. Ideal para cafés cortos o capuchinos.',
      material: 'Cerámica – Ø 7.5 × 8.5 cm',
      categoria: 'Cocina – Vajilla',
      precio: 7900,
      emoji: '☕'
    },
    {
      sku: 'JAC01-11',
      nombre: 'Mug cerámico "Coffee" colores surtidos – 230 ml',
      descripcion: 'Taza con diseño "Coffee" en tonos tierra. Ideal para uso diario o cafeterías.',
      material: 'Cerámica – Ø 7.5 × 8.5 cm',
      categoria: 'Cocina – Vajilla',
      precio: 7900,
      emoji: '☕'
    },
    {
      sku: 'JAC01-13',
      nombre: 'Mug cerámico grande con diseño moderno – 360 ml',
      descripcion: 'Taza grande para café o bebidas calientes. Diseño moderno en 3 colores surtidos.',
      material: 'Cerámica – Ø 8 × 11.5 cm',
      categoria: 'Cocina – Vajilla',
      precio: 10900,
      emoji: '☕'
    },
    {
      sku: 'JAC01-15',
      nombre: 'Mug cerámico vintage en colores pastel – 380 ml',
      descripcion: 'Taza de cerámica estilo vintage, colores pastel y borde metálico. Ideal para regalo.',
      material: 'Cerámica – Ø 9 × 9.7 cm',
      categoria: 'Cocina – Vajilla',
      precio: 11500,
      emoji: '🍵'
    },
    {
      sku: 'JAC01-17',
      nombre: 'Mug cerámico con diseño geométrico colorido – 260 ml',
      descripcion: 'Taza decorada con patrones geométricos coloridos. Ideal para café, té o regalo.',
      material: 'Cerámica – 7.4 × 8.5 cm',
      categoria: 'Cocina – Vajilla',
      precio: 6500,
      emoji: '🎨'
    },
    {
      sku: 'JAC01-18',
      nombre: 'Mug cerámico blanco con frases inspiradoras – 300 ml',
      descripcion: 'Taza blanca con ilustraciones y frases motivadoras en negro. Perfecta para oficina.',
      material: 'Cerámica – 8.8 × 9.3 cm',
      categoria: 'Cocina – Vajilla',
      precio: 9800,
      emoji: '💭'
    },
    // Vasos
    {
      sku: 'JAC01-20',
      nombre: 'Set 6 vasos altos de vidrio facetado – 475 ml',
      descripcion: 'Set de 6 vasos de vidrio transparente con diseño facetado tipo restaurante.',
      material: 'Vidrio – 6 pcs – 475 ml – 15 cm alto',
      categoria: 'Cocina – Vajilla',
      precio: 39900,
      emoji: '🥤'
    },
    {
      sku: 'JAC01-21',
      nombre: 'Set 6 vasos altos con diseños surtidos – 440 ml',
      descripcion: 'Juego de 6 vasos de vidrio transparente con diseños variados, ideales para agua o jugo.',
      material: 'Vidrio – 6×12 cm',
      categoria: 'Cocina – Vajilla',
      precio: 11000,
      emoji: '🥤'
    },
    {
      sku: 'JAC01-163',
      nombre: 'Vaso alto de vidrio Hua Xin – 500 ml',
      descripcion: 'Vaso de vidrio transparente con cuerpo liso y base gruesa. Resistente y elegante.',
      material: 'Vidrio – 500 ml – 16 cm alto',
      categoria: 'Cocina – Vajilla',
      precio: 39900,
      emoji: '🥛'
    },
    {
      sku: 'JAC01-164',
      nombre: 'Vaso alto estriado – 450 ml',
      descripcion: 'Vaso de vidrio transparente con cuerpo estriado vertical y acabado brillante.',
      material: 'Vidrio – 450 ml – 16.5 cm alto',
      categoria: 'Cocina – Vajilla',
      precio: 39900,
      emoji: '🍹'
    },
    {
      sku: 'JAC01-165',
      nombre: 'Vaso largo liso – 450 ml',
      descripcion: 'Vaso de vidrio transparente sin relieve, acabado cristalino y base gruesa.',
      material: 'Vidrio – 450 ml – 16 cm alto',
      categoria: 'Cocina – Vajilla',
      precio: 39900,
      emoji: '🥃'
    },
    {
      sku: 'JAC01-166',
      nombre: 'Set 6 vasos altos lisos de vidrio – 450 ml',
      descripcion: 'Set de 6 vasos de vidrio templado liso, resistentes y elegantes para uso diario.',
      material: 'Vidrio – 450 ml',
      categoria: 'Cocina – Vajilla',
      precio: 15000,
      emoji: '🥛'
    },
    {
      sku: 'JAC01-170',
      nombre: 'Set de 6 vasos de vidrio',
      descripcion: 'Juego de 6 vasos de vidrio transparente de alta calidad para uso diario.',
      material: 'Vidrio',
      categoria: 'Cocina – Vajilla',
      precio: 30000,
      emoji: '🥛',
      active: true
    },
    // Almacenamiento
    {
      sku: 'JAC01-22',
      nombre: 'Set de contenedores herméticos rosados – 3 piezas',
      descripcion: 'Set de tres recipientes redondos de vidrio con tapas rosadas herméticas.',
      material: 'Vidrio / Silicona – 3 pzas',
      categoria: 'Cocina – Almacenamiento',
      precio: 29000,
      emoji: '🥡'
    },
    {
      sku: 'JAC01-23',
      nombre: 'Set de contenedores herméticos colores variados – 3 piezas',
      descripcion: 'Conjunto de tres contenedores herméticos en colores variados. Sellado seguro y apilables.',
      material: 'Vidrio / Silicona – 3 pzas',
      categoria: 'Cocina – Almacenamiento',
      precio: 59500,
      emoji: '🍱'
    },
    {
      sku: 'JAC01-24',
      nombre: 'Recipiente hermético de vidrio con tapa colores variados – 500 ml',
      descripcion: 'Contenedor individual de vidrio templado con tapa hermética en dos colores variados.',
      material: 'Vidrio / Silicona – 500 ml – 14 × 6 cm',
      categoria: 'Cocina – Almacenamiento',
      precio: 44100,
      emoji: '🥡'
    },
    {
      sku: 'JAC01-25',
      nombre: 'Set 3 recipientes herméticos redondos – colores surtidos',
      descripcion: 'Conjunto de 3 recipientes plásticos con tapa hermética, ideales para almacenar alimentos.',
      material: 'PP + silicona – Ø17.5×7 / Ø15.5×6.5 / Ø12×6 cm',
      categoria: 'Cocina – Almacenamiento',
      precio: 17000,
      emoji: '🥡'
    },
    {
      sku: 'JAC01-39',
      nombre: 'Mini selladores plásticos de colores – Set 12 unidades',
      descripcion: 'Selladores plásticos de colores para bolsas de snacks o alimentos.',
      material: 'Plástico PP – 12 pzas',
      categoria: 'Cocina – Organización',
      precio: 3500,
      emoji: '📎'
    },
    {
      sku: 'JAC01-52',
      nombre: 'Set de recipientes plásticos redondos con tapa – 1 L',
      descripcion: 'Recipiente de 1 L con tapa hermética y esponja. Ideal para cocina o almacenamiento.',
      material: 'Plástico – 14.5 × 13.5 cm',
      categoria: 'Cocina – Almacenamiento',
      precio: 9500,
      emoji: '🥡'
    },
    // Utensilios
    {
      sku: 'JAC01-37',
      nombre: 'Rallador multifuncional con tapa colores variados – Set 4 en 1',
      descripcion: 'Rallador redondo con tapa y base plástica. Incluye cuchillas intercambiables en colores variados.',
      material: 'Plástico PP / Acero inox – 19 × 15.5 × 5 cm',
      categoria: 'Cocina – Utensilios',
      precio: 17000,
      emoji: '🔪'
    },
    {
      sku: 'JAC01-38',
      nombre: 'Rallador rectangular con mango verde – Acero inoxidable',
      descripcion: 'Rallador manual con mango ergonómico y cuerpo metálico.',
      material: 'Acero inox / Plástico – 20 × 11 cm',
      categoria: 'Cocina – Utensilios',
      precio: 12000,
      emoji: '🥕'
    },
    {
      sku: 'JAC01-100',
      nombre: 'Cuchillo pelador multifuncional con funda – 18.8 cm',
      descripcion: 'Pelador de frutas y verduras con cuchilla afilada de acero inoxidable.',
      material: 'Acero inoxidable + ABS – 18.8 cm',
      categoria: 'Cocina – Utensilios',
      precio: 6000,
      emoji: '🔪'
    },
    {
      sku: 'JAC01-162',
      nombre: 'Pineapple Knife – Cuchillo para piña',
      descripcion: 'Cuchillo pelador de piña con diseño ergonómico y hoja de acero inoxidable.',
      material: 'Acero inoxidable + ABS',
      categoria: 'Cocina – Utensilios',
      precio: 15300,
      emoji: '🍍'
    },
    // Cubiertos
    {
      sku: 'JAC01-43',
      nombre: 'Juego de cucharas de postre plateadas – 6 piezas',
      descripcion: 'Set de 6 cucharas de acero inoxidable pulido, resistentes y duraderas.',
      material: 'Acero inox – Longitud 14 cm',
      categoria: 'Cocina – Cubiertos',
      precio: 9000,
      emoji: '🥄'
    },
    {
      sku: 'JAC01-44',
      nombre: 'Juego de cuchillos bicolor negro-beige – 6 piezas',
      descripcion: 'Cuchillos decorativos con mango bicolor negro y beige.',
      material: 'Acero inox / Plástico – 20.5 cm',
      categoria: 'Cocina – Cubiertos',
      precio: 14900,
      emoji: '🔪'
    },
    {
      sku: 'JAC01-45',
      nombre: 'Set de cucharas plateadas – colores variados – 6 piezas',
      descripcion: 'Cucharas con mango en colores variados y acabado metálico brillante.',
      material: 'Acero inox / Plástico – 17 cm',
      categoria: 'Cocina – Cubiertos',
      precio: 15600,
      emoji: '🍴'
    },
    {
      sku: 'JAC01-82',
      nombre: 'Set de cuchillos con bloque de almacenamiento – 7 pzas',
      descripcion: 'Juego de 7 cuchillos de acero inoxidable con bloque organizador.',
      material: 'Acero inoxidable + ABS',
      categoria: 'Cocina – Cuchillería',
      precio: 64000,
      emoji: '🔪'
    },
    {
      sku: 'JAC01-83',
      nombre: 'Set de cubiertos de acero inoxidable – 24 pzas',
      descripcion: 'Set de cubiertos elegante de 24 piezas con acabado brillante y soporte metálico.',
      material: 'Acero inoxidable',
      categoria: 'Cocina – Cubiertos',
      precio: 66000,
      emoji: '🍴'
    },
    {
      sku: 'JAC01-84',
      nombre: 'Set 19 utensilios de cocina con mango de madera – color menta',
      descripcion: 'Kit completo con 19 piezas: cucharones, espátulas, batidor, cuchillos, tijeras y tabla.',
      material: 'Silicona + madera + acero',
      categoria: 'Cocina – Utensilios',
      precio: 99000,
      emoji: '🍳'
    },
    {
      sku: 'JAC01-85',
      nombre: 'Set 19 utensilios de cocina con mango de madera – color blanco',
      descripcion: 'Juego de 19 utensilios de cocina de silicona con mango de madera.',
      material: 'Silicona + madera + acero',
      categoria: 'Cocina – Utensilios',
      precio: 86600,
      emoji: '🍳'
    },
    // Jarras y termos
    {
      sku: 'JAC01-50',
      nombre: 'Tabla para picar set de 3 piezas en 6 colores variados',
      descripcion: 'Set de 3 tablas rectangulares en 6 colores variados. Medidas: 36×23×1.0CM y 30×20×1.0CM.',
      material: 'Plástico PP / Antideslizante – 36×23×1.0CM / 30×20×1.0CM',
      categoria: 'Cocina – Utensilios',
      precio: 32100,
      emoji: '🍽️'
    },
    {
      sku: 'JAC01-51',
      nombre: 'Set de cuatro coladores plásticos',
      descripcion: 'Set de 4 coladores de diferentes tamaños, ideales para cocina.',
      material: 'Plástico PP',
      categoria: 'Cocina – Accesorios',
      precio: 30500,
      emoji: '🩣'
    },
    {
      sku: 'JAC01-53',
      nombre: 'Set jarra + 4 vasos diseño floral – 1 jarra y 4 tazas',
      descripcion: 'Juego de jarra con 4 tazas a juego. Diseño decorativo con flores y colores pastel.',
      material: 'Plástico + vidrio',
      categoria: 'Cocina – Vajilla',
      precio: 42000,
      emoji: '🏺'
    },
    {
      sku: 'JAC01-54',
      nombre: 'Set de 5 piezas jarra con vasos colores variados',
      descripcion: 'Juego de 5 piezas con jarra y vasos. Medidas: 24×9.5CM y 8×9.5CM. Colores variados.',
      material: 'Vidrio – 24×9.5CM / 8×9.5CM',
      categoria: 'Cocina – Vajilla',
      precio: 45000,
      emoji: '🏵️'
    },
    {
      sku: 'JAC01-55',
      nombre: 'Jarra plástica con vaso medidor – 1.5 L',
      descripcion: 'Jarra translúcida con tapa y vaso acoplado del mismo color.',
      material: 'Plástico PP – 1.5 L',
      categoria: 'Cocina – Utensilios',
      precio: 17500,
      emoji: '🥤'
    },
    {
      sku: 'JAC01-66',
      nombre: 'Termo metálico estampado café – 1.9 L',
      descripcion: 'Termo con diseño de café, tapa hermética y asa de transporte.',
      material: 'Acero inoxidable – 1.9 L',
      categoria: 'Cocina – Termos',
      precio: 49000,
      emoji: '☕'
    },
    {
      sku: 'JAC01-93',
      nombre: 'Jarra térmica blanca de cerámica con tapa plateada – 1.5 L',
      descripcion: 'Jarra térmica elegante de cerámica blanca con tapa metálica.',
      material: 'Cerámica + acero – 1.5 L',
      categoria: 'Cocina – Vajilla',
      precio: 45000,
      emoji: '☕'
    },
    {
      sku: 'JAC01-102',
      nombre: 'Soporte metálico para botellón de agua – 2 colores',
      descripcion: 'Soporte inclinable para dispensadores de agua. Estructura estable y resistente.',
      material: 'Metal',
      categoria: 'Cocina – Accesorios',
      precio: 18900,
      emoji: '💧'
    },
    // Sets de vajilla
    {
      sku: 'JAC01-122',
      nombre: 'Set 4 tazas con platos blancos – 150 ml',
      descripcion: 'Conjunto de 4 tazas de cerámica blanca con platos. Diseño clásico.',
      material: 'Cerámica – 6.7×8.7 cm',
      categoria: 'Cocina – Vajilla',
      precio: 57600,
      emoji: '☕'
    },
    {
      sku: 'JAC01-123',
      nombre: 'Set 6 tazas blancas de cerámica – 250 ml',
      descripcion: 'Set de 6 tazas blancas de cerámica resistente, aptas para microondas.',
      material: 'Cerámica – 8.5×7.6 cm',
      categoria: 'Cocina – Vajilla',
      precio: 43400,
      emoji: '☕'
    },
    {
      sku: 'JAC01-124',
      nombre: 'Dispensador de bebidas con base y 6 tazas – verde jade',
      descripcion: 'Dispensador cerámico de lujo con base de bambú, grifo dorado y 6 tazas.',
      material: 'Cerámica + bambú',
      categoria: 'Cocina – Decoración',
      precio: 408000,
      emoji: '🍵'
    },
    {
      sku: 'JAC01-125',
      nombre: 'Dispensador de bebidas con base y 6 tazas – blanco',
      descripcion: 'Dispensador blanco de cerámica con base de bambú y grifo dorado.',
      material: 'Cerámica + bambú',
      categoria: 'Cocina – Decoración',
      precio: 367000,
      emoji: '🍵'
    },
    // Especieros y organización
    {
      sku: 'JAC01-2',
      nombre: 'Set 4 especieros de vidrio con base y tapas flor dorada',
      descripcion: 'Set de lujo con 4 frascos de vidrio, tapas en forma de flor dorada y base de bambú.',
      material: 'Vidrio + bambú + metal – 4 pzas',
      categoria: 'Cocina – Organización',
      precio: 89900,
      emoji: '🧂'
    },
    {
      sku: 'JAC01-3',
      nombre: 'Set 2 especieros de vidrio con base y tapas flor dorada',
      descripcion: 'Dos frascos de vidrio con tapas flor dorada, cucharas y soporte de bambú.',
      material: 'Vidrio + bambú + metal – 2 pzas',
      categoria: 'Cocina – Organización',
      precio: 45000,
      emoji: '🧂'
    },
    {
      sku: 'JAC01-4',
      nombre: 'Set 3 especieros de vidrio con soporte metálico dorado',
      descripcion: 'Set de 3 especieros con base dorada y tapas de bambú, incluye cucharitas.',
      material: 'Vidrio + bambú + metal – 3 pzas',
      categoria: 'Cocina – Organización',
      precio: 62000,
      emoji: '🧂'
    },
    {
      sku: 'JAC01-120',
      nombre: 'Set 3 especieros cerámicos blancos',
      descripcion: 'Tres especieros de cerámica blanca con tapa.',
      material: 'Cerámica – 7 × 8 cm',
      categoria: 'Cocina – Organización',
      precio: 34500,
      emoji: '🧂'
    },
    {
      sku: 'JAC01-121',
      nombre: 'Set 3 especieros cerámicos verdes',
      descripcion: 'Conjunto de 3 especieros verdes con tapas.',
      material: 'Cerámica – 8 × 7.5 cm',
      categoria: 'Cocina – Organización',
      precio: 36500,
      emoji: '🧂'
    },
    {
      sku: 'JAC01-74',
      nombre: 'Individual de mesa rectangular beige – 30×45 cm (set × 12)',
      descripcion: 'Set de 12 individuales de mesa tejidos, resistentes al calor.',
      material: 'PVC – 30 × 45 cm',
      categoria: 'Cocina – Decoración',
      precio: 11000,
      emoji: '🍽️'
    },
    {
      sku: 'JAC01-75',
      nombre: 'Individual de mesa redondo dorado – 38×38 cm (set × 12)',
      descripcion: 'Individuales elegantes redondos con acabado metálico. Resistentes y decorativos.',
      material: 'PVC – 38 × 38 cm',
      categoria: 'Cocina – Decoración',
      precio: 4500,
      emoji: '🍽️'
    },
    // Electrodomésticos
    {
      sku: 'JAC01-94',
      nombre: 'Hervidor eléctrico de acero inoxidable – 2 L',
      descripcion: 'Hervidor eléctrico de 2 L con apagado automático y mango ergonómico aislante.',
      material: 'Acero inoxidable – 2 L',
      categoria: 'Cocina – Electrodomésticos',
      precio: 39000,
      emoji: '♨️'
    },
    {
      sku: 'JAC01-96',
      nombre: 'Freidora de aire RAF 5 L – panel análogo ref 5232b',
      descripcion: 'Air Fryer RAF 5 L con panel análogo de perillas y cesta antiadherente. 1500 W.',
      material: 'Plástico + acero – 5 L – 1500 W',
      categoria: 'Cocina – Electrodomésticos',
      precio: 217000,
      emoji: '🍟',
      active: false
    },
    {
      sku: 'JAC01-97',
      nombre: 'Licuadora metálica RAF 2 velocidades + pulso – 1.5 L',
      descripcion: 'Licuadora RAF con vaso de vidrio grueso, motor potente y función pulso.',
      material: 'Vidrio + acero inoxidable – 1.5 L',
      categoria: 'Cocina – Electrodomésticos',
      precio: 229000,
      emoji: '🥤'
    },
    {
      sku: 'JAC01-104',
      nombre: 'Dispensador de agua con medidas 13.5×7.4 cm – dos colores',
      descripcion: 'Dispensador de agua compacto disponible en dos colores.',
      material: 'Plástico – 13.5×7.4 cm',
      categoria: 'Cocina – Accesorios',
      precio: 25900,
      emoji: '💧'
    },
    {
      sku: 'JAC01-105',
      nombre: 'Mini sellador de bolsas portátil 2 en 1 – negro',
      descripcion: 'Sellador portátil con función de corte y sellado.',
      material: 'Plástico + metal – 20 × 6 cm',
      categoria: 'Cocina – Utensilios',
      precio: 26000,
      emoji: '🔒'
    },
    {
      sku: 'JAC01-107',
      nombre: 'Purificador de agua SWS – cartucho cerámico recambiable',
      descripcion: 'Filtro de agua con cartucho cerámico que elimina cloro y metales pesados.',
      material: 'ABS + cerámica',
      categoria: 'Cocina – Accesorios',
      precio: 38000,
      emoji: '💧',
      active: false
    },
    {
      sku: 'JAC01-108',
      nombre: 'Purificador de agua SWS – versión premium transparente',
      descripcion: 'Filtro SWS transparente con cartucho reemplazable. Filtra más del 90%.',
      material: 'ABS transparente + cerámica',
      categoria: 'Cocina – Accesorios',
      precio: 40000,
      emoji: '🚰',
      active: false
    },
    {
      sku: 'JAC01-65',
      nombre: 'Termo metálico deportivo – 1.9L',
      descripcion: 'Botella térmica de acero inoxidable con tapa roscada. 1.9L y 37×13.5CM.',
      material: 'Acero inoxidable – 1.9L – 37×13.5 cm',
      categoria: 'Cocina – Termos',
      precio: 82500,
      emoji: '🥤'
    }
  ],

  baño: [
    {
      sku: 'JAC01-26',
      nombre: 'Dispensador de jabón',
      descripcion: 'Dispensador de jabón líquido con diseño moderno y elegante.',
      material: 'Plástico / Metal',
      categoria: 'Baño – Accesorios',
      precio: 15000,
      emoji: '🧴',
      active: true
    },
    {
      sku: 'JAC01-28',
      nombre: 'Dispensador de jabón cerámico colores variados con dosificador dorado – 300 ml',
      descripcion: 'Dosificador decorativo en cerámica en tres colores variados con acabado brillante.',
      material: 'Cerámica / Metal – 300 ml',
      categoria: 'Baño – Accesorios',
      precio: 28900,
      emoji: '🧼'
    },
    {
      sku: 'JAC01-29',
      nombre: 'Dispensador de jabón colores variados con tapa de madera clara – 280 ml',
      descripcion: 'Elegante dispensador en tres colores variados con tapa tipo bambú.',
      material: 'Cerámica / Metal – 280 ml',
      categoria: 'Baño – Accesorios',
      precio: 21800,
      emoji: '🧼'
    },
    {
      sku: 'JAC01-30',
      nombre: 'Dispensador de jabón colores variados con tapa de bambú – 280 ml',
      descripcion: 'Variante en colores variados con bomba metálica plateada.',
      material: 'Cerámica / Metal – 280 ml',
      categoria: 'Baño – Accesorios',
      precio: 25400,
      emoji: '🧼'
    },
    {
      sku: 'JAC01-31',
      nombre: 'Dispensador de jabón gris con base transparente – 250 ml',
      descripcion: 'Dispensador moderno con cuerpo gris mate y base transparente.',
      material: 'Plástico ABS / Metal – 250 ml',
      categoria: 'Baño – Accesorios',
      precio: 17900,
      emoji: '🧴'
    },
    {
      sku: 'JAC01-32',
      nombre: 'Dispensador de jabón cerámico colores variados con detalles dorados – 300 ml',
      descripcion: 'Dosificador elegante en tres colores variados con líneas doradas y bomba metálica.',
      material: 'Cerámica / Metal – 300 ml',
      categoria: 'Baño – Accesorios',
      precio: 28900,
      emoji: '✨'
    },
    {
      sku: 'JAC01-33',
      nombre: 'Set 3 piezas de baño gris – vaso + jabón + cepillo',
      descripcion: 'Set completo de baño color gris oscuro, incluye dispensador, vaso y portacepillos.',
      material: 'Cerámica / Metal – 3 pzas',
      categoria: 'Baño – Sets',
      precio: 35000,
      emoji: '🛁'
    },
    {
      sku: 'JAC01-47',
      nombre: 'Set de jabones decorativos en caja – 4 piezas',
      descripcion: 'Pack decorativo de jabones de colores surtidos y formas variadas.',
      material: 'Jabón artesanal / Plástico – Set 4 pzas',
      categoria: 'Baño – Decoración',
      precio: 12500,
      emoji: '🧼'
    },
    {
      sku: 'JAC01-58',
      nombre: 'Cepillo sanitario colores variados – 58×12.5×12CM',
      descripcion: 'Cepillo de baño con cerdas duraderas y base estable en tres colores variados.',
      material: 'Plástico PP – 58×12.5×12 cm',
      categoria: 'Baño – Limpieza',
      precio: 25900,
      emoji: '🚽'
    },
    {
      sku: 'JAC01-59',
      nombre: 'Cepillo sanitario colores variados – 48.5×13.4CM',
      descripcion: 'Escobilla de baño con mango ergonómico y base redonda en colores variados.',
      material: 'Plástico PP – 48.5×13.4 cm',
      categoria: 'Baño – Limpieza',
      precio: 18000,
      emoji: '🚽'
    },
    {
      sku: 'JAC01-60',
      nombre: 'Cepillo sanitario colores variados – 54×12CM',
      descripcion: 'Cepillo para baño en colores variados con mango largo y base firme.',
      material: 'Plástico PP – 54×12 cm',
      categoria: 'Baño – Limpieza',
      precio: 26700,
      emoji: '🧹'
    },
    {
      sku: 'JAC01-62',
      nombre: 'Caja para almuerzo en dos colores – 21×12.5×8CM',
      descripcion: 'Contenedor para almuerzo con tapa hermética, disponible en dos colores.',
      material: 'Plástico PP – 21×12.5×8 cm',
      categoria: 'Cocina – Almuerzo',
      precio: 43700,
      emoji: '🍱'
    },
    // Cortinas y tapetes de baño
    {
      sku: 'JAC01-68',
      nombre: 'Cortina de baño impermeable blanca – 150×180 cm',
      descripcion: 'Cortina de baño en color blanco, resistente al agua. Incluye ganchos.',
      material: 'PEVA – 150 × 180 cm',
      categoria: 'Baño – Accesorios',
      precio: 7000,
      emoji: '🚿'
    },
    {
      sku: 'JAC01-69',
      nombre: 'Cortina de baño con diseño azul – 150×180 cm',
      descripcion: 'Cortina impermeable con estampado azul, incluye ganchos.',
      material: 'PEVA – 150 × 180 cm',
      categoria: 'Baño – Accesorios',
      precio: 6500,
      emoji: '🚿'
    },
    {
      sku: 'JAC01-70',
      nombre: 'Tapete antideslizante de baño color café – 74×44.5 cm',
      descripcion: 'Alfombra de baño con base antideslizante y textura suave.',
      material: 'PVC – 74 × 44.5 cm',
      categoria: 'Baño – Seguridad',
      precio: 18500,
      emoji: '🛁'
    },
    {
      sku: 'JAC01-71',
      nombre: 'Tapete de baño rectangular color beige – 38×58 cm',
      descripcion: 'Alfombra para baño de secado rápido, ideal para absorber humedad.',
      material: 'PVC – 38 × 58 cm',
      categoria: 'Baño – Seguridad',
      precio: 10900,
      emoji: '🛁'
    },
    {
      sku: 'JAC01-72',
      nombre: 'Tapete antideslizante de baño blanco – 34×68 cm',
      descripcion: 'Tapete blanco con textura de burbujas, ideal para bañera o ducha.',
      material: 'PVC – 34 × 68 cm',
      categoria: 'Baño – Seguridad',
      precio: 14000,
      emoji: '🛁'
    },
    {
      sku: 'JAC01-73',
      nombre: 'Tapete antideslizante azul con textura circular – 37×67 cm',
      descripcion: 'Alfombra azul antideslizante con diseño moderno. Lavable y duradero.',
      material: 'PVC – 37 × 67 cm',
      categoria: 'Baño – Seguridad',
      precio: 13000,
      emoji: '🛁'
    }
  ],

  limpieza: [
    {
      sku: 'JAC01-34',
      nombre: 'Paños de poliéster multicolor – Set 5 unidades 30×30 cm',
      descripcion: 'Paños suaves y absorbentes de poliéster con colores surtidos.',
      material: 'Poliéster – 30×30 cm',
      categoria: 'Limpieza – Hogar',
      precio: 9900,
      emoji: '🧻'
    },
    {
      sku: 'JAC01-35',
      nombre: 'Paños de poliéster neutros – Set 5 unidades 30×30 cm',
      descripcion: 'Paños beige y marrones de poliéster grueso con alta absorción.',
      material: 'Poliéster – 30×30 cm',
      categoria: 'Limpieza – Hogar',
      precio: 13990,
      emoji: '🧻'
    },
    {
      sku: 'JAC01-36',
      nombre: 'Set 3 paños de cocina poliéster – 25×25 cm',
      descripcion: 'Paños absorbentes de poliéster para limpieza de cocina o baño.',
      material: 'Poliéster – 25 × 25 cm',
      categoria: 'Limpieza – Cocina',
      precio: 6500,
      emoji: '🧻'
    },
    {
      sku: 'JAC01-46',
      nombre: 'Recogedor de cinco piezas en 3 colores variados – 40×16.5 cm',
      descripcion: 'Set de recogedor con cepillo de 5 piezas en 3 colores variados.',
      material: 'Plástico PP – 40 × 16.5 cm',
      categoria: 'Limpieza – Hogar',
      precio: 30700,
      emoji: '🧹'
    },
    {
      sku: 'JAC01-61',
      nombre: 'Set 2 en 1 cepillo + recogedor compacto – blanco y verde',
      descripcion: 'Set de limpieza 2 en 1 que incluye cepillo largo y recogedor.',
      material: 'Plástico PP – 66 × 28 × 14 cm',
      categoria: 'Limpieza – Hogar',
      precio: 97800,
      emoji: '🧹'
    },
    {
      sku: 'JAC01-67',
      nombre: 'Set de trapeador giratorio con balde doble compartimiento',
      descripcion: 'Trapeador giratorio de 360° con balde doble y escurridor integrado.',
      material: 'Plástico + acero inoxidable – 45 × 25.5 × 23 cm',
      categoria: 'Limpieza – Hogar',
      precio: 36000,
      emoji: '🧹'
    }
  ],

  organización: [
    {
      sku: 'JAC01-42',
      nombre: 'Ganchos decorativos "Deportes" – Set 4 unidades',
      descripcion: 'Set de ganchos adhesivos con diseños deportivos.',
      material: 'Plástico ABS / Metal – Set 4 pzas',
      categoria: 'Organización – Hogar',
      precio: 3000,
      emoji: '⚽'
    },
    {
      sku: 'JAC01-48',
      nombre: 'Gancho doble de plástico colores variados – Set 5 unidades',
      descripcion: 'Ganchos de plástico resistente con doble cuelgue en colores variados.',
      material: 'Plástico PP – Set 5 pzas',
      categoria: 'Organización – Hogar',
      precio: 20600,
      emoji: '🪝'
    },
    {
      sku: 'JAC01-49',
      nombre: 'Ganchos de plástico lila – Set 10 unidades',
      descripcion: 'Ganchos ligeros de plástico con gancho giratorio.',
      material: 'Plástico PP – Set 10 pzas',
      categoria: 'Organización – Hogar',
      precio: 25100,
      emoji: '👕'
    },
    {
      sku: 'JAC01-56',
      nombre: 'Molde para helado de 4 piezas',
      descripcion: 'Molde para hacer helados caseros de 4 piezas.',
      material: 'Plástico PP',
      categoria: 'Cocina – Utensilios',
      precio: 17500,
      emoji: '🧁'
    },
    {
      sku: 'JAC01-63',
      nombre: 'Caja organizadora en dos colores con tapa abatible – 17×17×7 cm',
      descripcion: 'Contenedor cuadrado compacto en dos colores.',
      material: 'Plástico PP – 17×17×7 cm',
      categoria: 'Organización – Hogar',
      precio: 38000,
      emoji: '📦'
    },
    {
      sku: 'JAC01-64',
      nombre: 'Caja organizadora tres colores rectangular – 23×14×9 cm',
      descripcion: 'Caja plástica con tapa hermética en tres colores.',
      material: 'Plástico PP – 23×14×9 cm',
      categoria: 'Organización – Hogar',
      precio: 39000,
      emoji: '🔧'
    },
    {
      sku: 'JAC01-86',
      nombre: 'Carrito de mercado plegable en dos colores – 40 L',
      descripcion: 'Carrito plegable con estructura de metal y bolsa de tela resistente en dos colores.',
      material: 'Metal + poliéster – 94×33×19 cm',
      categoria: 'Organización – Compras',
      precio: 79900,
      emoji: '🛒'
    },
    {
      sku: 'JAC01-92',
      nombre: 'Bolsa reutilizable con logo "Shopping" naranja – 50×52 cm',
      descripcion: 'Bolsa ecológica reforzada con asas resistentes y diseño impreso.',
      material: 'Polipropileno laminado – 50 × 52 cm',
      categoria: 'Organización – Reutilizables',
      precio: 3500,
      emoji: '🛍️'
    },
    {
      sku: 'JAC01-101',
      nombre: 'Soporte ajustable para neveras, lavadoras, etc.',
      descripcion: 'Base ajustable plegable para electrodomésticos pesados con ajuste de altura y ángulo.',
      material: 'Aluminio – 38.5×4.5 cm',
      categoria: 'Organización – Hogar',
      precio: 23300,
      emoji: '🪑'
    }
  ],

  decoración: [
    {
      sku: 'JAC01-81',
      nombre: 'Lámpara LED de mesa con diseño infantil Stitch – rosa',
      descripcion: 'Lámpara de mesa flexible con luz LED blanca y base decorativa de Stitch.',
      material: 'Plástico + LED – 28 × 8 cm',
      categoria: 'Decoración – Iluminación',
      precio: 29900,
      emoji: '💡'
    },
    {
      sku: 'JAC01-156',
      nombre: 'Lámpara decorativa de mesa redonda con efecto 3D – 20 cm',
      descripcion: 'Lámpara LED decorativa en forma redonda con efecto 3D.',
      material: 'Acrílico + ABS – 20 cm',
      categoria: 'Decoración – Iluminación',
      precio: 79000,
      emoji: '🌙'
    },
    {
      sku: 'JAC01-157',
      nombre: 'Lámpara decorativa de mesa en forma de corazón con efecto 3D – 20 cm',
      descripcion: 'Lámpara LED efecto 3D en forma de corazón con base dorada.',
      material: 'Acrílico + ABS – 20 cm',
      categoria: 'Decoración – Iluminación',
      precio: 79000,
      emoji: '❤️'
    },
    {
      sku: 'JAC01-158',
      nombre: 'Lámpara decorativa de mesa circular con luz LED – 21 cm',
      descripcion: 'Lámpara LED circular con base metálica. Diseño moderno.',
      material: 'Acrílico + ABS – 21 cm',
      categoria: 'Decoración – Iluminación',
      precio: 55000,
      emoji: '💡'
    },
    {
      sku: 'JAC01-159',
      nombre: 'Lámpara decorativa con base metálica – 24 cm',
      descripcion: 'Lámpara LED de 24 cm con base estable, luz cálida.',
      material: 'Acrílico + ABS – 24 cm',
      categoria: 'Decoración – Iluminación',
      precio: 52000,
      emoji: '🔆'
    },
    {
      sku: 'JAC01-160',
      nombre: 'Lámpara decorativa con base metálica efecto 3D – 24 cm',
      descripcion: 'Lámpara LED efecto 3D de 24 cm, luz cálida ajustable.',
      material: 'Acrílico + ABS – 24 cm',
      categoria: 'Decoración – Iluminación',
      precio: 53000,
      emoji: '✨'
    },
    {
      sku: 'JAC01-113',
      nombre: 'Set 12 velas aromáticas Blueberry / Apple / Lavanda',
      descripcion: 'Pack de 12 velas aromáticas en vaso de aluminio.',
      material: 'Parafina – Ø 3.5 cm',
      categoria: 'Decoración – Aromaterapia',
      precio: 14500,
      emoji: '🕯️'
    },
    {
      sku: 'JAC01-114',
      nombre: 'Set 24 velas tea light blancas – 6 horas de duración',
      descripcion: 'Pack de 24 velas blancas tea light.',
      material: 'Parafina – 3.5 cm',
      categoria: 'Decoración – Aromaterapia',
      precio: 18800,
      emoji: '🕯️'
    },
    {
      sku: 'JAC01-115',
      nombre: 'Set 24 velas tea light aroma frutal rojo',
      descripcion: 'Velas aromáticas rojas tea light de larga duración.',
      material: 'Parafina – 3.5 cm',
      categoria: 'Decoración – Aromaterapia',
      precio: 19200,
      emoji: '🕯️'
    },
    {
      sku: 'JAC01-116',
      nombre: 'Set 24 velas tea light blancas premium – Caja grande',
      descripcion: 'Velas blancas tea light de larga duración premium.',
      material: 'Parafina – 24 unid',
      categoria: 'Decoración – Velas',
      precio: 19500,
      emoji: '🕯️'
    },
    {
      sku: 'JAC01-117',
      nombre: 'Set 6 velas rosadas – aroma floral',
      descripcion: 'Pack de 6 velas rosadas tipo tea light, perfume floral ligero.',
      material: 'Parafina – 5.5 cm',
      categoria: 'Decoración – Aromaterapia',
      precio: 13100,
      emoji: '🌸'
    },
    {
      sku: 'JAC01-118',
      nombre: 'Set 7 velas estrellas doradas – decoración navideña',
      descripcion: 'Velas doradas en forma de estrella ideal para centros de mesa.',
      material: 'Parafina – 5.7 × 2 cm',
      categoria: 'Decoración – Navidad',
      precio: 12000,
      emoji: '⭐'
    },
    {
      sku: 'JAC01-119',
      nombre: 'Set 7 velas rojas decorativas – Ø 4.1 cm',
      descripcion: 'Pack de 7 velas tea light rojas de aroma dulce.',
      material: 'Parafina – 4.1 cm',
      categoria: 'Decoración – Aromaterapia',
      precio: 8500,
      emoji: '❤️'
    },

  ],

  tecnología: [
    {
      sku: 'JAC01-76',
      nombre: 'Máquina cortapelo recargable T9 Gold – Edición Barber Pro',
      descripcion: 'Cortadora T9 de metal dorado, motor silencioso.',
      material: 'Metal + ABS – 14.5 cm',
      categoria: 'Tecnología – Cuidado Personal',
      precio: 90000,
      emoji: '💈'
    },
    {
      sku: 'JAC01-77',
      nombre: 'Mini ventilador USB de mesa – colores variados',
      descripcion: 'Ventilador compacto con base de metal y alimentación USB en colores variados.',
      material: 'Metal + plástico – 12.8×6.5 cm',
      categoria: 'Tecnología – Ventiladores',
      precio: 30000,
      emoji: '💨'
    },
    {
      sku: 'JAC01-78',
      nombre: 'Mini ventilador USB de mesa – colores variados',
      descripcion: 'Ventilador silencioso de plástico en colores variados con USB.',
      material: 'Plástico ABS – 13×12.5 cm',
      categoria: 'Tecnología – Ventiladores',
      precio: 37900,
      emoji: '💨'
    },
    {
      sku: 'JAC01-79',
      nombre: 'Mini ventilador colores variados con base',
      descripcion: 'Ventilador recargable compacto con base plana en colores variados.',
      material: 'Plástico ABS – 14×10.5 cm',
      categoria: 'Tecnología – Ventiladores',
      precio: 35000,
      emoji: '🍃'
    },
    {
      sku: 'JAC01-80',
      nombre: 'Ventilador de clip recargable blanco',
      descripcion: 'Ventilador portátil con clip. Medidas 16.5×32 cm.',
      material: 'Plástico ABS – 16.5×32 cm',
      categoria: 'Tecnología – Ventiladores',
      precio: 34500,
      emoji: '💨'
    },
    {
      sku: 'JAC01-87',
      nombre: 'Secador de cabello profesional Mozh 1875 W – negro',
      descripcion: 'Secador con motor potente de 1875 W.',
      material: 'Plástico + metal – 110 V / 50-60 Hz',
      categoria: 'Tecnología – Belleza',
      precio: 130000,
      emoji: '💨'
    },
    {
      sku: 'JAC01-88',
      nombre: 'Secador de cabello VGR V-508 – colores surtidos',
      descripcion: 'Secador compacto de 2000 W con 2 velocidades. 110V.',
      material: 'Plástico + metal – 2000 W – 110 V',
      categoria: 'Tecnología – Belleza',
      precio: 72000,
      emoji: '💨'
    },
    {
      sku: 'JAC01-89',
      nombre: 'Plancha alisadora Kemei KM-329 – 3 colores',
      descripcion: 'Plancha para el cabello con placas cerámicas. 110V.',
      material: 'Cerámica + plástico – 110 V',
      categoria: 'Tecnología – Belleza',
      precio: 89900,
      emoji: '💇'
    },
    {
      sku: 'JAC01-95',
      nombre: 'Plancha para ropa profesional – 110 V',
      descripcion: 'Plancha para la ropa de alta potencia. 110V.',
      material: 'Plástico + metal – 110 V',
      categoria: 'Tecnología – Hogar',
      precio: 169000,
      emoji: '👔'
    }
  ],

  bienestar: [
    {
      sku: 'JAC01-109',
      nombre: 'Manguera extensible para jardín – 7.5 m x 3X',
      descripcion: 'Manguera extensible azul de 7.5 m con adaptador universal.',
      material: 'Poliéster + látex – 7.5 m',
      categoria: 'Hogar – Jardinería',
      precio: 18500,
      emoji: '🌱'
    },
    {
      sku: 'JAC01-110',
      nombre: 'Bolsa térmica de agua colores variados – 19×24.5 cm',
      descripcion: 'Bolsa de agua caliente con funda de felpa en colores variados.',
      material: 'PVC + felpa – 19×24.5 cm',
      categoria: 'Bienestar – Salud',
      precio: 15000,
      emoji: '🧸'
    },
    {
      sku: 'JAC01-111',
      nombre: 'Bolsa térmica de agua colores variados – 19×24.5 cm',
      descripcion: 'Bolsa de agua caliente con funda de felpa en colores variados.',
      material: 'PVC + felpa – 19×24.5 cm',
      categoria: 'Bienestar – Salud',
      precio: 15000,
      emoji: '🐰'
    },
    {
      sku: 'JAC01-112',
      nombre: 'Bolsa térmica de agua colores variados – 19×24.5 cm',
      descripcion: 'Bolsa de agua caliente con funda de felpa en colores variados.',
      material: 'PVC + felpa – 19×24.5 cm',
      categoria: 'Bienestar – Salud',
      precio: 15000,
      emoji: '🧸'
    }
  ],

  deportes: [
    {
      sku: 'JAC01-98',
      nombre: 'Balón de baloncesto tamaño 7 – PU profesional',
      descripcion: 'Balón de básquet tamaño 7 en PU resistente, textura antideslizante.',
      material: 'PU – Talla 7',
      categoria: 'Deportes – Baloncesto',
      precio: 39000,
      emoji: '🏀'
    },
    {
      sku: 'JAC01-99',
      nombre: 'Balón de fútbol tamaño 5 – PU multicolor',
      descripcion: 'Balón de fútbol profesional tamaño 5, costuras reforzadas.',
      material: 'PU – Talla 5',
      categoria: 'Deportes – Fútbol',
      precio: 48000,
      emoji: '⚽'
    },
    {
      sku: 'JAC01-1',
      nombre: 'Botella deportiva térmica con asa y correa – 2 L',
      descripcion: 'Botella de agua deportiva de 2 litros, disponible en 4 colores, con correa ajustable y tapa hermética.',
      material: 'Plástico PP – 2000 ml',
      categoria: 'Deportes – Hidratación',
      precio: 39000,
      emoji: '💧'
    }
  ]
}
