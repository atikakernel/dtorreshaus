# Assets del Proyecto

## Estructura de carpetas

```
public/assets/
└── products/          # Imágenes de productos
```

## Cómo agregar imágenes de productos

1. Toma una foto del producto con buena iluminación
2. Nombra el archivo con el SKU del producto (ejemplo: `JAC01-5.jpg`)
3. Sube la imagen a la carpeta `public/assets/products/`
4. Formatos soportados: `.jpg`, `.jpeg`, `.png`, `.webp`

### Ejemplo

Si tienes el producto con SKU **JAC01-5**, sube la imagen como:
- `public/assets/products/JAC01-5.jpg` o
- `public/assets/products/JAC01-5.png`

La aplicación detectará automáticamente la imagen y la mostrará en la tarjeta del producto.

## Recomendaciones

- **Resolución**: 800x800px mínimo
- **Formato**: JPG o PNG (WebP para mejor rendimiento)
- **Tamaño**: Menor a 500KB por imagen
- **Fondo**: Blanco o neutro preferiblemente
- **Iluminación**: Natural y uniforme
