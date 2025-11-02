import { useState } from 'react'
import { ShoppingCart, Home, X, Plus, Minus, Trash2, ChefHat, Droplet, Sparkles, Package, Lightbulb, Zap, Heart } from 'lucide-react'

// Catálogo de productos organizados por sección
const productsData = {
  cocina: [
    // Existentes
    {
      sku: 'JAC01-5',
      nombre: 'Dispensador de vidrio con bomba cromada – 200 ml',
      descripcion: 'Dispensador de vidrio transparente con tapa metálica cromada y bomba dosificadora. Ideal para jabón líquido, aceite o vinagre.',
      material: 'Vidrio / Acero inox. – 200 ml – 14.5 × 6 cm',
      categoria: 'Cocina – Accesorios',
      precio: 9900,
      emoji: '🧴'
    },
    {
      sku: 'JAC01-6',
      nombre: 'Botella térmica de vidrio con tapa metálica – 500 ml',
      descripcion: 'Botella de vidrio transparente con tapa de acero y recubrimiento exterior de colores surtidos. Perfecta para agua, jugos o té.',
      material: 'Vidrio / Acero inox. – 500 ml – 17 cm alto',
      categoria: 'Cocina – Hidratación',
      precio: 14500,
      emoji: '🍶'
    },
    {
      sku: 'JAC01-7',
      nombre: 'Dispensador de aceite o vinagre – 170 ml',
      descripcion: 'Botella dispensadora de vidrio con pico vertedor metálico. Ideal para aceite de oliva o vinagre.',
      material: 'Vidrio / Acero inox. – 170 ml – 17 × 4 cm',
      categoria: 'Cocina – Utensilios',
      precio: 10200,
      emoji: '🫒'
    },
    {
      sku: 'JAC01-8',
      nombre: 'Pulverizador de aceite – 300 ml (blanco / negro)',
      descripcion: 'Atomizador recargable de cocina para aceite o vinagre, con boquilla de pulverización fina.',
      material: 'Plástico PET / Acero – 300 ml – 20 × 5.5 cm',
      categoria: 'Cocina – Utensilios',
      precio: 18900,
      emoji: '💦'
    },
    {
      sku: 'JAC01-20',
      nombre: 'Vaso alto de vidrio facetado – 475 ml',
      descripcion: 'Vaso de vidrio transparente con diseño facetado tipo restaurante. Apto para lavavajillas.',
      material: 'Vidrio – 475 ml – 15 cm alto',
      categoria: 'Cocina – Vajilla',
      precio: 6500,
      emoji: '🥤'
    },
    {
      sku: 'JAC01-163',
      nombre: 'Vaso alto de vidrio Hua Xin – 500 ml',
      descripcion: 'Vaso de vidrio transparente con cuerpo liso y base gruesa. Resistente y elegante.',
      material: 'Vidrio – 500 ml – 16 cm alto',
      categoria: 'Cocina – Vajilla',
      precio: 6900,
      emoji: '🥛'
    },
    {
      sku: 'JAC01-164',
      nombre: 'Vaso alto estriado – 450 ml',
      descripcion: 'Vaso de vidrio transparente con cuerpo estriado vertical y acabado brillante.',
      material: 'Vidrio – 450 ml – 16.5 cm alto',
      categoria: 'Cocina – Vajilla',
      precio: 6500,
      emoji: '🍹'
    },
    {
      sku: 'JAC01-165',
      nombre: 'Vaso largo liso – 450 ml',
      descripcion: 'Vaso de vidrio transparente sin relieve, acabado cristalino y base gruesa.',
      material: 'Vidrio – 450 ml – 16 cm alto',
      categoria: 'Cocina – Vajilla',
      precio: 6400,
      emoji: '🥃'
    },
    {
      sku: 'JAC01-22',
      nombre: 'Set de contenedores herméticos rosados – 3 piezas',
      descripcion: 'Set de tres recipientes redondos de vidrio con tapas rosadas herméticas. Aptos para microondas.',
      material: 'Vidrio / Silicona – 3 pzas',
      categoria: 'Cocina – Almacenamiento',
      precio: 29000,
      emoji: '🥡'
    },
    {
      sku: 'JAC01-23',
      nombre: 'Set de contenedores herméticos rosados – 3 piezas (variación B)',
      descripcion: 'Conjunto de tres contenedores herméticos rosados. Sellado seguro y apilables.',
      material: 'Vidrio / Silicona – 3 pzas',
      categoria: 'Cocina – Almacenamiento',
      precio: 29000,
      emoji: '🍱'
    },
    {
      sku: 'JAC01-24',
      nombre: 'Recipiente hermético de vidrio con tapa rosada – 650 ml',
      descripcion: 'Contenedor individual de vidrio templado con tapa hermética rosada. Apto para microondas.',
      material: 'Vidrio / Silicona – 650 ml – 14 × 6 cm',
      categoria: 'Cocina – Almacenamiento',
      precio: 12900,
      emoji: '🥡'
    },
    {
      sku: 'JAC01-39',
      nombre: 'Mini selladores plásticos de colores – Set 12 unidades',
      descripcion: 'Selladores plásticos de colores para bolsas de snacks o alimentos. Prácticos y resistentes.',
      material: 'Plástico PP – 12 pzas',
      categoria: 'Cocina – Organización',
      precio: 3500,
      emoji: '📎'
    },
    // Nuevos productos de cocina
    {
      sku: 'JAC01-37',
      nombre: 'Rallador multifuncional con tapa azul – Set 4 en 1',
      descripcion: 'Rallador redondo con tapa y base plástica. Incluye cuchillas intercambiables para vegetales y quesos.',
      material: 'Plástico PP / Acero inox – 19 × 18.5 × 5 cm',
      categoria: 'Cocina – Utensilios',
      precio: 17000,
      emoji: '🔪'
    },
    {
      sku: 'JAC01-38',
      nombre: 'Rallador rectangular con mango verde – Acero inoxidable',
      descripcion: 'Rallador manual con mango ergonómico y cuerpo metálico. Perfecto para rallar verduras, quesos o frutas.',
      material: 'Acero inox / Plástico – 20 × 11 cm',
      categoria: 'Cocina – Utensilios',
      precio: 12000,
      emoji: '🥕'
    },
    {
      sku: 'JAC01-43',
      nombre: 'Juego de cucharas de postre plateadas – 6 piezas',
      descripcion: 'Set de 6 cucharas de acero inoxidable pulido, resistentes y duraderas. Aptas para lavavajillas.',
      material: 'Acero inox – Longitud 14 cm',
      categoria: 'Cocina – Cubiertos',
      precio: 9000,
      emoji: '🥄'
    },
    {
      sku: 'JAC01-44',
      nombre: 'Juego de cucharas bicolor negro-beige – 6 piezas',
      descripcion: 'Cucharas decorativas con mango bicolor negro y beige. Ideales para mesa moderna.',
      material: 'Acero inox / Plástico – 20.5 cm',
      categoria: 'Cocina – Cubiertos',
      precio: 10500,
      emoji: '🥄'
    },
    {
      sku: 'JAC01-45',
      nombre: 'Set de cucharas plateadas – mango negro – 6 piezas',
      descripcion: 'Cucharas con mango negro y acabado metálico brillante. Diseño elegante para uso diario.',
      material: 'Acero inox / Plástico – 17 cm',
      categoria: 'Cocina – Cubiertos',
      precio: 10500,
      emoji: '🍴'
    },
    {
      sku: 'JAC01-50',
      nombre: 'Tabla para picar y servir con diseño mármol negro-dorado',
      descripcion: 'Tabla rectangular con diseño tipo mármol negro y vetas doradas. Ideal para cortar o servir.',
      material: 'Plástico PP / Antideslizante – 28 × 19 cm',
      categoria: 'Cocina – Utensilios',
      precio: 17500,
      emoji: '🍽️'
    },
    {
      sku: 'JAC01-51',
      nombre: 'Tapete antideslizante para lavaplatos o cocina – naranja',
      descripcion: 'Tapete redondo de silicona resistente al calor, ideal para escurrir vajilla o colocar ollas.',
      material: 'Silicona – Ø 24 cm',
      categoria: 'Cocina – Accesorios',
      precio: 9000,
      emoji: '🟠'
    },
    {
      sku: 'JAC01-54',
      nombre: 'Jarra decorativa color ámbar con relieve – 1.7 L',
      descripcion: 'Jarra de vidrio con diseño vintage y relieve floral, color ámbar claro. Perfecta para agua o jugo.',
      material: 'Vidrio – 1.7 L – 8 × 25 cm',
      categoria: 'Cocina – Vajilla',
      precio: 19000,
      emoji: '🏺'
    },
    {
      sku: 'JAC01-55',
      nombre: 'Jarra plástica con vaso medidor – 1.5 L',
      descripcion: 'Jarra translúcida con tapa y vaso acoplado del mismo color. Ideal para jugos o agua fría.',
      material: 'Plástico PP – 1.5 L',
      categoria: 'Cocina – Utensilios',
      precio: 17500,
      emoji: '🥤'
    },
    {
      sku: 'JAC01-96',
      nombre: 'Freidora de aire RAF 5.5 L – negro dorado',
      descripcion: 'Air Fryer RAF 5.5 L con panel digital táctil, temperatura ajustable y cesta antiadherente.',
      material: 'Plástico + acero – 5.5 L – 1000 W',
      categoria: 'Cocina – Electrodomésticos',
      precio: 405000,
      emoji: '🍟'
    },
    {
      sku: 'JAC01-97',
      nombre: 'Licuadora metálica RAF 2 velocidades + pulso – 1.5 L',
      descripcion: 'Licuadora RAF con vaso de vidrio grueso, motor potente y función pulso. Incluye molinillo.',
      material: 'Vidrio + acero inoxidable – 1.5 L',
      categoria: 'Cocina – Electrodomésticos',
      precio: 91000,
      emoji: '🥤'
    },
    {
      sku: 'JAC01-104',
      nombre: 'Batidor eléctrico portátil recargable USB',
      descripcion: 'Mini batidor eléctrico para café o proteína, recargable por USB, velocidad ajustable.',
      material: 'Plástico + metal – 11 × 7 cm',
      categoria: 'Cocina – Electrodomésticos',
      precio: 14000,
      emoji: '☕'
    },
    {
      sku: 'JAC01-105',
      nombre: 'Mini sellador de bolsas portátil 2 en 1 – negro',
      descripcion: 'Sellador portátil con función de corte y sellado, ideal para mantener frescos los alimentos.',
      material: 'Plástico + metal – 20 × 6 cm',
      categoria: 'Cocina – Utensilios',
      precio: 26000,
      emoji: '🔒'
    },
    {
      sku: 'JAC01-107',
      nombre: 'Purificador de agua SWS – cartucho cerámico recambiable',
      descripcion: 'Filtro de agua con cartucho cerámico que elimina cloro y metales pesados. Fácil instalación.',
      material: 'ABS + cerámica',
      categoria: 'Cocina – Accesorios',
      precio: 38000,
      emoji: '💧'
    },
    {
      sku: 'JAC01-108',
      nombre: 'Purificador de agua SWS – versión premium transparente',
      descripcion: 'Filtro SWS transparente con cartucho reemplazable. Filtra más del 90% de impurezas.',
      material: 'ABS transparente + cerámica',
      categoria: 'Cocina – Accesorios',
      precio: 40000,
      emoji: '🚰'
    },
    {
      sku: 'JAC01-120',
      nombre: 'Set 3 especieros cerámicos blancos con bandeja de bambú',
      descripcion: 'Tres especieros de cerámica blanca con tapa y cucharita de bambú, incluyen bandeja.',
      material: 'Cerámica + bambú – 7 × 8 cm',
      categoria: 'Cocina – Organización',
      precio: 34500,
      emoji: '🧂'
    },
    {
      sku: 'JAC01-121',
      nombre: 'Set 3 especieros cerámicos verdes con bandeja de bambú',
      descripcion: 'Conjunto de 3 especieros verdes con tapas de bambú y cucharitas. Diseño elegante.',
      material: 'Cerámica + bambú – 8 × 7.5 cm',
      categoria: 'Cocina – Organización',
      precio: 36500,
      emoji: '🧂'
    }
  ],
  baño: [
    {
      sku: 'JAC01-28',
      nombre: 'Dispensador de jabón cerámico beige con dosificador dorado – 300 ml',
      descripcion: 'Dosificador decorativo en cerámica color beige con acabado brillante y bomba dorada.',
      material: 'Cerámica / Metal – 300 ml',
      categoria: 'Baño – Accesorios',
      precio: 18900,
      emoji: '🧼'
    },
    {
      sku: 'JAC01-29',
      nombre: 'Dispensador de jabón gris con tapa de madera clara – 280 ml',
      descripcion: 'Elegante dispensador gris texturizado con tapa tipo bambú y bomba plateada.',
      material: 'Cerámica / Metal – 280 ml',
      categoria: 'Baño – Accesorios',
      precio: 15000,
      emoji: '🧼'
    },
    {
      sku: 'JAC01-30',
      nombre: 'Dispensador de jabón gris oscuro con tapa de bambú – 280 ml',
      descripcion: 'Variante más oscura con bomba metálica plateada y cuerpo gris antracita texturizado.',
      material: 'Cerámica / Metal – 280 ml',
      categoria: 'Baño – Accesorios',
      precio: 15500,
      emoji: '🧼'
    },
    {
      sku: 'JAC01-31',
      nombre: 'Dispensador de jabón gris con base transparente – 250 ml',
      descripcion: 'Dispensador moderno con cuerpo gris mate y base transparente. Bomba cromada resistente.',
      material: 'Plástico ABS / Metal – 250 ml',
      categoria: 'Baño – Accesorios',
      precio: 17900,
      emoji: '🧴'
    },
    {
      sku: 'JAC01-32',
      nombre: 'Dispensador de jabón cerámico blanco con detalles dorados – 300 ml',
      descripcion: 'Dosificador blanco elegante con líneas doradas y bomba metálica.',
      material: 'Cerámica / Metal – 300 ml',
      categoria: 'Baño – Accesorios',
      precio: 18500,
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
      descripcion: 'Pack decorativo de jabones de colores surtidos y formas variadas. Presentación en caja.',
      material: 'Jabón artesanal / Plástico – Set 4 pzas',
      categoria: 'Baño – Decoración',
      precio: 12500,
      emoji: '🧼'
    },
    {
      sku: 'JAC01-58',
      nombre: 'Cepillo sanitario con base cuadrada – color rosa',
      descripcion: 'Cepillo de baño con cerdas duraderas y base estable color rosado. Diseño compacto.',
      material: 'Plástico PP – 5.8 × 37 cm',
      categoria: 'Baño – Limpieza',
      precio: 17000,
      emoji: '🚽'
    },
    {
      sku: 'JAC01-59',
      nombre: 'Cepillo sanitario color verde oliva – base redonda',
      descripcion: 'Escobilla de baño con mango ergonómico y base redonda. Cerdas resistentes.',
      material: 'Plástico PP – 6.8 × 41 cm',
      categoria: 'Baño – Limpieza',
      precio: 18000,
      emoji: '🚽'
    },
    {
      sku: 'JAC01-60',
      nombre: 'Cepillo sanitario color beige – base redonda',
      descripcion: 'Cepillo para baño color beige con mango largo y base firme. Estilo minimalista.',
      material: 'Plástico PP – 6.8 × 41 cm',
      categoria: 'Baño – Limpieza',
      precio: 12000,
      emoji: '🧹'
    },
    {
      sku: 'JAC01-62',
      nombre: 'Dispensador de jabón portátil con tapa verde – 250 ml',
      descripcion: 'Contenedor compacto para jabón líquido o champú, ideal para baño o viaje.',
      material: 'Plástico PP – 250 ml – 21 × 12.5 × 8 cm',
      categoria: 'Baño – Accesorios',
      precio: 23000,
      emoji: '🧴'
    }
  ],
  limpieza: [
    {
      sku: 'JAC01-34',
      nombre: 'Paños de microfibra multicolor – Set 5 unidades 30×30 cm',
      descripcion: 'Paños suaves y absorbentes de microfibra con colores surtidos. Perfectos para limpieza.',
      material: 'Microfibra – 30×30 cm',
      categoria: 'Limpieza – Hogar',
      precio: 8500,
      emoji: '🧽'
    },
    {
      sku: 'JAC01-35',
      nombre: 'Paños de microfibra neutros – Set 5 unidades 30×30 cm',
      descripcion: 'Paños beige y marrones de microfibra gruesa con alta absorción. Reutilizables.',
      material: 'Microfibra – 30×30 cm',
      categoria: 'Limpieza – Hogar',
      precio: 7500,
      emoji: '🧽'
    },
    {
      sku: 'JAC01-46',
      nombre: 'Recogedor con escobilla compacto – color rosado',
      descripcion: 'Mini recogedor de plástico con cepillo de limpieza. Compacto y fácil de guardar.',
      material: 'Plástico PP – 28 × 22 cm',
      categoria: 'Limpieza – Hogar',
      precio: 11000,
      emoji: '🧹'
    },
    {
      sku: 'JAC01-61',
      nombre: 'Set 2 en 1 cepillo + recogedor compacto – blanco y verde',
      descripcion: 'Set de limpieza 2 en 1 que incluye cepillo largo y recogedor encajable.',
      material: 'Plástico PP – 66 × 28 × 14 cm',
      categoria: 'Limpieza – Hogar',
      precio: 22000,
      emoji: '🧹'
    }
  ],
  organización: [
    {
      sku: 'JAC01-42',
      nombre: 'Ganchos decorativos "Deportes" – Set 4 unidades',
      descripcion: 'Set de ganchos adhesivos con diseños deportivos (fútbol, baloncesto, voleibol).',
      material: 'Plástico ABS / Metal – Set 4 pzas',
      categoria: 'Organización – Hogar',
      precio: 3000,
      emoji: '⚽'
    },
    {
      sku: 'JAC01-48',
      nombre: 'Gancho doble de plástico color beige – Set 3 unidades',
      descripcion: 'Ganchos de plástico resistente con doble cuelgue para ropa pesada o toallas.',
      material: 'Plástico PP – Set 3 pzas',
      categoria: 'Organización – Hogar',
      precio: 6500,
      emoji: '🪝'
    },
    {
      sku: 'JAC01-49',
      nombre: 'Ganchos de plástico lila – Set 6 unidades',
      descripcion: 'Ganchos ligeros de plástico con gancho giratorio. Ideal para ropa delicada.',
      material: 'Plástico PP – Set 6 pzas',
      categoria: 'Organización – Hogar',
      precio: 9900,
      emoji: '👕'
    },
    {
      sku: 'JAC01-56',
      nombre: 'Caja organizadora con diseño infantil – 14×14 cm',
      descripcion: 'Contenedor cuadrado con tapa abatible y diseño decorativo de personajes infantiles.',
      material: 'Plástico PP – 14 × 14 cm',
      categoria: 'Organización – Infantil',
      precio: 17500,
      emoji: '🎨'
    },
    {
      sku: 'JAC01-63',
      nombre: 'Caja organizadora verde oliva con tapa abatible – 19×19×7 cm',
      descripcion: 'Contenedor cuadrado compacto color verde oliva. Ideal para cosméticos o accesorios.',
      material: 'Plástico PP – 19 × 19 × 7 cm',
      categoria: 'Organización – Hogar',
      precio: 20500,
      emoji: '📦'
    },
    {
      sku: 'JAC01-64',
      nombre: 'Caja organizadora azul rectangular – 28×14×9 cm',
      descripcion: 'Caja plástica con tapa hermética color azul marino. Perfecta para herramientas pequeñas.',
      material: 'Plástico PP – 28 × 14 × 9 cm',
      categoria: 'Organización – Hogar',
      precio: 20500,
      emoji: '🔧'
    },
    {
      sku: 'JAC01-86',
      nombre: 'Carrito de mercado plegable con bolsa azul – 40 L',
      descripcion: 'Carrito plegable con estructura de metal y bolsa de tela resistente. Incluye ruedas.',
      material: 'Metal + poliéster – 32 × 40 × 96 cm',
      categoria: 'Organización – Compras',
      precio: 38000,
      emoji: '🛒'
    }
  ],
  decoración: [
    {
      sku: 'JAC01-81',
      nombre: 'Lámpara LED de mesa con diseño infantil Stitch – rosa',
      descripcion: 'Lámpara de mesa flexible con luz LED blanca y base decorativa de Stitch.',
      material: 'Plástico + LED – 28 × 8 cm',
      categoria: 'Decoración – Iluminación',
      precio: 17000,
      emoji: '💡'
    },
    {
      sku: 'JAC01-156',
      nombre: 'Lámpara decorativa de mesa redonda con efecto 3D – 25 cm',
      descripcion: 'Lámpara LED decorativa en forma redonda con efecto 3D de luz dinámica y base dorada.',
      material: 'Acrílico + ABS – 25 cm',
      categoria: 'Decoración – Iluminación',
      precio: 79000,
      emoji: '🌙'
    },
    {
      sku: 'JAC01-157',
      nombre: 'Lámpara decorativa de mesa en forma de corazón con efecto 3D – 25 cm',
      descripcion: 'Lámpara LED efecto 3D en forma de corazón con base dorada y luz cálida ajustable.',
      material: 'Acrílico + ABS – 25 cm',
      categoria: 'Decoración – Iluminación',
      precio: 79000,
      emoji: '❤️'
    },
    {
      sku: 'JAC01-113',
      nombre: 'Set 12 velas aromáticas Blueberry / Apple / Lavanda',
      descripcion: 'Pack de 12 velas aromáticas en vaso de aluminio, fragancias mixtas: arándano, manzana y lavanda.',
      material: 'Parafina – Ø 3.5 cm',
      categoria: 'Decoración – Aromaterapia',
      precio: 14500,
      emoji: '🕯️'
    },
    {
      sku: 'JAC01-114',
      nombre: 'Set 24 velas tea light blancas – 6 horas de duración',
      descripcion: 'Pack de 24 velas blancas tea light con duración aprox. de 6 h.',
      material: 'Parafina – 3.5 cm',
      categoria: 'Decoración – Aromaterapia',
      precio: 18800,
      emoji: '🕯️'
    },
    {
      sku: 'JAC01-115',
      nombre: 'Set 24 velas tea light aroma frutal rojo',
      descripcion: 'Velas aromáticas rojas tea light de larga duración. Aroma intenso.',
      material: 'Parafina – 3.5 cm',
      categoria: 'Decoración – Aromaterapia',
      precio: 19200,
      emoji: '🕯️'
    },
    {
      sku: 'JAC01-116',
      nombre: 'Set 24 velas tea light blancas premium – Caja grande',
      descripcion: 'Velas blancas tea light de larga duración, presentadas en caja grande premium.',
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
      precio: 2200,
      emoji: '🌸'
    },
    {
      sku: 'JAC01-118',
      nombre: 'Set 7 velas estrellas doradas – decoración navideña',
      descripcion: 'Velas doradas en forma de estrella ideal para centros de mesa y eventos.',
      material: 'Parafina – 5.9 × 2 cm',
      categoria: 'Decoración – Navidad',
      precio: 12000,
      emoji: '⭐'
    },
    {
      sku: 'JAC01-119',
      nombre: 'Set 7 velas rojas decorativas – Ø 4.1 cm',
      descripcion: 'Pack de 7 velas tea light rojas de aroma dulce. Perfectas para decoración romántica.',
      material: 'Parafina – 4.1 cm',
      categoria: 'Decoración – Aromaterapia',
      precio: 8500,
      emoji: '❤️'
    }
  ],
  tecnología: [
    {
      sku: 'JAC01-65',
      nombre: 'Termo metálico deportivo – 420 ml',
      descripcion: 'Botella térmica de acero inoxidable con tapa roscada. Mantiene temperatura por horas.',
      material: 'Acero inoxidable – 420 ml – 8 × 19.5 cm',
      categoria: 'Tecnología – Accesorios',
      precio: 34500,
      emoji: '🥤'
    },
    {
      sku: 'JAC01-76',
      nombre: 'Máquina cortapelo recargable T9 Gold – Edición Barber Pro',
      descripcion: 'Cortadora T9 de metal dorado, motor silencioso y batería recargable USB.',
      material: 'Metal + ABS – 16.8 cm',
      categoria: 'Tecnología – Cuidado Personal',
      precio: 90000,
      emoji: '💈'
    },
    {
      sku: 'JAC01-77',
      nombre: 'Mini ventilador USB de mesa – color azul',
      descripcion: 'Ventilador compacto con base de metal y alimentación USB. Ideal para oficina.',
      material: 'Metal + plástico – 13 × 6.5 cm',
      categoria: 'Tecnología – Ventiladores',
      precio: 19500,
      emoji: '💨'
    },
    {
      sku: 'JAC01-78',
      nombre: 'Mini ventilador USB de mesa – color rosa',
      descripcion: 'Ventilador silencioso de plástico rosado con alimentación USB y ángulo ajustable.',
      material: 'Plástico ABS – 13 × 12.8 cm',
      categoria: 'Tecnología – Ventiladores',
      precio: 21500,
      emoji: '💨'
    },
    {
      sku: 'JAC01-79',
      nombre: 'Mini ventilador con base color verde oliva',
      descripcion: 'Ventilador recargable compacto con base plana. Excelente flujo de aire.',
      material: 'Plástico ABS – 10 × 11.5 cm',
      categoria: 'Tecnología – Ventiladores',
      precio: 19500,
      emoji: '🍃'
    },
    {
      sku: 'JAC01-80',
      nombre: 'Ventilador de clip recargable blanco – giro ajustable',
      descripcion: 'Ventilador portátil con clip para escritorio o cama. Recargable vía USB, rotación 360°.',
      material: 'Plástico ABS – 8.3 cm',
      categoria: 'Tecnología – Ventiladores',
      precio: 34500,
      emoji: '💨'
    },
    {
      sku: 'JAC01-87',
      nombre: 'Secador de cabello profesional Mozh 1875 W – negro',
      descripcion: 'Secador con motor potente de 1875 W, diseño ergonómico y boquilla concentradora.',
      material: 'Plástico + metal – 220 V / 50-60 Hz',
      categoria: 'Tecnología – Belleza',
      precio: 69000,
      emoji: '💨'
    },
    {
      sku: 'JAC01-88',
      nombre: 'Secador de cabello VGR V-508 – colores surtidos',
      descripcion: 'Secador compacto de 2000 W con 2 velocidades y boquilla concentradora.',
      material: 'Plástico + metal – 2000 W',
      categoria: 'Tecnología – Belleza',
      precio: 61500,
      emoji: '💨'
    },
    {
      sku: 'JAC01-89',
      nombre: 'Plancha alisadora Kemei KM-329 – 3 colores',
      descripcion: 'Plancha para el cabello con placas cerámicas, control de temperatura y cable giratorio.',
      material: 'Cerámica + plástico',
      categoria: 'Tecnología – Belleza',
      precio: 32000,
      emoji: '💇'
    },
    {
      sku: 'JAC01-95',
      nombre: 'Secador de cabello Super Power 3200 – profesional',
      descripcion: 'Secador 3200 W con tecnología iónica, boquilla concentradora y cable largo reforzado.',
      material: 'Plástico + metal – 220 V',
      categoria: 'Tecnología – Belleza',
      precio: 68000,
      emoji: '💨'
    }
  ],
  bienestar: [
    {
      sku: 'JAC01-109',
      nombre: 'Manguera extensible para jardín – 7.5 m x 3X',
      descripcion: 'Manguera extensible azul de 7.5 m con adaptador universal. Se expande hasta 3 veces.',
      material: 'Poliéster + látex – 7.5 m',
      categoria: 'Bienestar – Jardinería',
      precio: 18500,
      emoji: '🌱'
    },
    {
      sku: 'JAC01-110',
      nombre: 'Bolsa térmica de agua con funda oso marrón – 19×28 cm',
      descripcion: 'Bolsa de agua caliente con funda de felpa marrón. Ideal para dolores musculares.',
      material: 'PVC + felpa – 19 × 28 cm',
      categoria: 'Bienestar – Salud',
      precio: 15000,
      emoji: '🧸'
    },
    {
      sku: 'JAC01-111',
      nombre: 'Bolsa térmica de agua con funda conejo – 19×28 cm',
      descripcion: 'Bolsa de agua caliente con funda de felpa crema y dibujo de conejo. Tacto suave.',
      material: 'PVC + felpa – 19 × 28 cm',
      categoria: 'Bienestar – Salud',
      precio: 15000,
      emoji: '🐰'
    },
    {
      sku: 'JAC01-112',
      nombre: 'Bolsa térmica de agua con funda rosa oso – 19×28 cm',
      descripcion: 'Versión rosada de bolsa de agua caliente con diseño de oso bordado.',
      material: 'PVC + felpa – 19 × 28 cm',
      categoria: 'Bienestar – Salud',
      precio: 15000,
      emoji: '🧸'
    }
  ]
}

// Formato de precio colombiano
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price)
}

// Componente para imagen del producto con fallback
const ProductImage = ({ sku, emoji }) => {
  const [imageError, setImageError] = useState(false)

  const tryLoadImage = () => {
    if (imageError) return null
    const imagePath = `/assets/products/${sku}.jpeg`
    return (
      <img
        src={imagePath}
        alt={sku}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => setImageError(true)}
      />
    )
  }

  return (
    <div className="product-image">
      {!imageError ? tryLoadImage() : emoji}
    </div>
  )
}

function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Filtrar productos según categoría activa
  const getFilteredProducts = () => {
    if (activeCategory === 'all') {
      return [
        ...productsData.cocina,
        ...productsData.baño,
        ...productsData.limpieza,
        ...productsData.organización,
        ...productsData.decoración,
        ...productsData.tecnología,
        ...productsData.bienestar
      ]
    }
    return productsData[activeCategory] || []
  }

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.sku === product.sku)
      if (existingItem) {
        return prevCart.map(item =>
          item.sku === product.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  // Actualizar cantidad
  const updateQuantity = (sku, change) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.sku === sku
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    )
  }

  // Remover del carrito
  const removeFromCart = (sku) => {
    setCart(prevCart => prevCart.filter(item => item.sku !== sku))
  }

  // Calcular total del carrito
  const cartTotal = cart.reduce((total, item) => total + (item.precio * item.quantity), 0)
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <Home size={32} />
            <span>dtorreshaus</span>
          </div>
          <button className="cart-button" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={20} />
            Carrito
            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        <div className="container">
          <div className="nav-buttons">
            <button
              className={`nav-button ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              <Home size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Todo
            </button>
            <button
              className={`nav-button ${activeCategory === 'cocina' ? 'active' : ''}`}
              onClick={() => setActiveCategory('cocina')}
            >
              <ChefHat size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Cocina
            </button>
            <button
              className={`nav-button ${activeCategory === 'baño' ? 'active' : ''}`}
              onClick={() => setActiveCategory('baño')}
            >
              <Droplet size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Baño
            </button>
            <button
              className={`nav-button ${activeCategory === 'limpieza' ? 'active' : ''}`}
              onClick={() => setActiveCategory('limpieza')}
            >
              <Sparkles size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Limpieza
            </button>
            <button
              className={`nav-button ${activeCategory === 'organización' ? 'active' : ''}`}
              onClick={() => setActiveCategory('organización')}
            >
              <Package size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Organización
            </button>
            <button
              className={`nav-button ${activeCategory === 'decoración' ? 'active' : ''}`}
              onClick={() => setActiveCategory('decoración')}
            >
              <Lightbulb size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Decoración
            </button>
            <button
              className={`nav-button ${activeCategory === 'tecnología' ? 'active' : ''}`}
              onClick={() => setActiveCategory('tecnología')}
            >
              <Zap size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Tecnología
            </button>
            <button
              className={`nav-button ${activeCategory === 'bienestar' ? 'active' : ''}`}
              onClick={() => setActiveCategory('bienestar')}
            >
              <Heart size={18} style={{ display: 'inline', marginRight: '5px' }} />
              Bienestar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container">
        <div className="hero">
          <h1>Bienvenido a dtorreshaus</h1>
          <p>Tu tienda de artículos para el hogar en Colombia</p>
        </div>
      </div>

      {/* Products Section */}
      <main className="container">
        <section className="products-section">
          <h2 className="section-title">
            {activeCategory === 'all' && 'Todos los Productos'}
            {activeCategory === 'cocina' && 'Cocina'}
            {activeCategory === 'baño' && 'Baño'}
            {activeCategory === 'limpieza' && 'Limpieza'}
            {activeCategory === 'organización' && 'Organización'}
            {activeCategory === 'decoración' && 'Decoración'}
            {activeCategory === 'tecnología' && 'Tecnología'}
            {activeCategory === 'bienestar' && 'Bienestar'}
          </h2>
          <div className="products-grid">
            {getFilteredProducts().map(product => (
              <div key={product.sku} className="product-card">
                <ProductImage sku={product.sku} emoji={product.emoji} />
                <div className="product-info">
                  <div className="product-sku">{product.sku}</div>
                  <h3 className="product-name">{product.nombre}</h3>
                  <p className="product-description">{product.descripcion}</p>
                  <div className="product-details">{product.material}</div>
                  <span className="product-category">{product.categoria}</span>
                  <div className="product-footer">
                    <span className="product-price">{formatPrice(product.precio)}</span>
                    <button
                      className="add-to-cart"
                      onClick={() => addToCart(product)}
                    >
                      <Plus size={16} />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Carrito de Compras</h2>
              <button className="close-cart" onClick={() => setIsCartOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.sku} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.nombre}</div>
                      <div className="cart-item-price">{formatPrice(item.precio)}</div>
                    </div>
                    <div className="cart-item-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.sku, -1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(item.sku, 1)}
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.sku)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="cart-total">
                <span>Total:</span>
                <span className="cart-total-price">{formatPrice(cartTotal)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <h3>dtorreshaus</h3>
          <p>Tu tienda de confianza para artículos del hogar</p>
          <p>Envíos a toda Colombia</p>
          <p style={{ marginTop: '20px', fontSize: '14px', opacity: '0.7' }}>
            © 2024 dtorreshaus. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
