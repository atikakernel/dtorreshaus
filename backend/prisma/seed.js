import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// We need to read productsData.js which is an ES module
// The easiest way is to copy it to a temporary JSON or just evaluate it
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando la migración de productos a la base de datos...')

  // Import products dynamically since it's an ES module Export
  // Emular la carga (esto funcionará si estamos en Node 18+ usando importación dinámica)
  const modulePath = path.resolve('../src/productsData.js');
  
  // Como `productsData.js` usa exports (ES Module) y este script podría estar corriendo
  // en CommonJS dependiento del package.json, vamos a usar un "truco" para leerlo
  
  const content = fs.readFileSync(modulePath, 'utf8')
  
  // Extraer productsData: (muy rudimentario, pero efectivo para esta migración de una sola vez)
  let productsData;
  try {
    // Reemplazar los export por variables locales que eval() pueda entender
    let evalContent = content.replace('export const categoryConfig =', 'const categoryConfig =');
    evalContent = evalContent.replace('export const productsData =', 'const ___productsData =');
    evalContent += ';\n return ___productsData;';
    
    // Ejecutar el módulo en un contexto seguro para extraer el objeto
    productsData = new Function(evalContent)();
  } catch(error) {
     console.error('Error parseando productsData.js:', error)
     process.exit(1)
  }

  let totalProducts = 0;
  let successCount = 0;

  for (const categoryName of Object.keys(productsData)) {
    console.log(`\nProcesando categoría: ${categoryName}`)
    const products = productsData[categoryName]
    
    for (const prod of products) {
      totalProducts++;
      try {
        // Generar un slug basado en el nombre si no existe
        const slug = prod.sku.toLowerCase()
        
        await prisma.product.upsert({
          where: { sku: prod.sku },
          update: {
            nombre: prod.nombre,
            descripcion: prod.descripcion,
            material: prod.material,
            categoria: prod.categoria,
            precio: Number(prod.precio),
            emoji: prod.emoji,
            active: prod.active !== false, // Default true if not explicitly false
            slug: slug
          },
          create: {
            sku: prod.sku,
            nombre: prod.nombre,
            descripcion: prod.descripcion,
            material: prod.material,
            categoria: prod.categoria,
            precio: Number(prod.precio),
            emoji: prod.emoji,
            active: prod.active !== false,
            stock: 10, // Default stock inicial
            slug: slug
          }
        })
        console.log(`✅ [${prod.sku}] ${prod.nombre}`)
        successCount++;
      } catch (error) {
        console.error(`❌ Error con producto ${prod.sku}:`, error.message)
      }
    }
  }

  console.log('\n================================')
  console.log(`✅ Migración completada. Guardados ${successCount} de ${totalProducts} productos.`)
  console.log('================================')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
