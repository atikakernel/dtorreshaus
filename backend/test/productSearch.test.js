/**
 * Tests del servicio de búsqueda de productos.
 * Ejecutar: node --test test/productSearch.test.js
 */
const { test } = require('node:test')
const assert = require('node:assert/strict')

const { normalizeText, filterProducts } = require('../services/productSearch.service')

const PRODUCTS = [
  { sku: 'LAB-001', nombre: 'Labubu Exciting Macaron', descripcion: 'Figura coleccionable', material: 'Vinilo', categoria: 'Labubu - Pop Mart', precio: 85000, stock: 5 },
  { sku: 'ARM-001', nombre: 'Gel Blaster Pro', descripcion: 'Réplica de gel', material: 'Plástico ABS', categoria: 'Armas - Gel Blasters', precio: 150000, stock: 0 },
  { sku: 'LAB-002', nombre: 'Labubu Cósmico Edición', descripcion: 'Edición limitada espacial', material: 'Vinilo', categoria: 'Labubu - Pop Mart', precio: 120000, stock: 2 },
]

test('normalizeText quita acentos y pasa a minúsculas', () => {
  assert.equal(normalizeText('Cósmico PLÁSTICO'), 'cosmico plastico')
  assert.equal(normalizeText(null), '')
})

test('búsqueda por texto libre ignora acentos y mayúsculas', () => {
  const results = filterProducts(PRODUCTS, { q: 'cosmico' })
  assert.deepEqual(results.map((p) => p.sku), ['LAB-002'])
})

test('búsqueda coincide contra material y SKU', () => {
  assert.equal(filterProducts(PRODUCTS, { q: 'plastico' }).length, 1)
  assert.equal(filterProducts(PRODUCTS, { q: 'lab-001' }).length, 1)
})

test('filtra por categoría parcial y rango de precios', () => {
  assert.equal(filterProducts(PRODUCTS, { categoria: 'labubu' }).length, 2)
  assert.deepEqual(
    filterProducts(PRODUCTS, { minPrecio: 90000, maxPrecio: 130000 }).map((p) => p.sku),
    ['LAB-002']
  )
})

test('inStock deja solo productos con stock disponible', () => {
  const results = filterProducts(PRODUCTS, { inStock: true })
  assert.deepEqual(results.map((p) => p.sku), ['LAB-001', 'LAB-002'])
})

test('sin criterios devuelve todo y entradas vacías no rompen', () => {
  assert.equal(filterProducts(PRODUCTS, {}).length, 3)
  assert.deepEqual(filterProducts(null, { q: 'x' }), [])
  assert.deepEqual(filterProducts(PRODUCTS, { q: 'inexistente' }), [])
})
