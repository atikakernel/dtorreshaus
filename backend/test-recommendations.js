/**
 * TEST RECOMMENDATIONS SCRIPT
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const ollamaService = require('./services/ollama.service');

const prisma = new PrismaClient();

async function runTest() {
  console.log('--- Probando el Agente de Recomendación ---');
  
  try {
    // 1. Verificar conexión a DB
    console.log('1. Verificando productos en la base de datos...');
    const products = await prisma.product.findMany({
      where: { active: true },
      take: 10
    });
    
    if (products.length === 0) {
      console.log('⚠️ No se encontraron productos activos en la base de datos.');
      console.log('Asegúrate de haber corrido las migraciones y sembrado la base de datos.');
      return;
    }
    
    console.log(`✅ Encontrados ${products.length} productos.`);
    
    // 2. Preparar Prompt
    console.log('2. Preparando prompt para Ollama...');
    const productListText = products.map(p => 
      `- [${p.sku}] ${p.nombre}: ${p.descripcion} (Precio: $${p.precio})`
    ).join('\n');

    const prompt = `
Aquí tienes una lista de productos:
${productListText}

Recomienda 2 productos y devuelve un JSON:
{
  "recommendations": [
    { "sku": "SKU", "reason": "Razón" }
  ]
}
`;

    // 3. Llamar a Ollama
    console.log('3. Llamando a Ollama (esto puede tardar según tu hardware)...');
    const aiResponse = await ollamaService.generateResponse(prompt);
    console.log('Respuesta cruda de la IA:', aiResponse);
    
    // 4. Parsear
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Recomendaciones generadas correctamente:');
      console.log(JSON.stringify(parsed, null, 2));
    } else {
      console.log('❌ No se encontró un JSON válido en la respuesta.');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
