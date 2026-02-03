/**
 * Tests para el servicio OCR de boletas chilenas
 */

import { describe, test, expect } from '@jest/globals';
import { parseChileanReceipt, detectCategory, detectCategoryByProducts, formatCLP } from '../../src/js/services/ocr.js';

describe('OCR Service', () => {
  describe('parseChileanReceipt', () => {
    test('debe extraer total de boleta chilena formato estándar', () => {
      const text = `
        LIDER EXPRESS
        RUT: 96.874.030-K
        FECHA: 2024-03-15

        1 LECHE LONCOLECHE 1LT      1.290
        2 PAN MOLDE IDEAL           2.490

        SUBTOTAL              3.780
        IVA                     718
        TOTAL                $4.498
      `;

      const result = parseChileanReceipt(text);
      expect(result.store).toBe('LIDER');
      expect(result.total).toBe('4498');
      expect(result.date).toBe('2024-03-15');
      expect(result.suggestedCategory).toBe('alimentacion');
    });

    test('debe extraer total con formato TOTAL A PAGAR', () => {
      const text = `
        JUMBO
        RUT: 96.439.000-2

        ARROZ TUCAPEL 1KG        1.590
        ACEITE CHEF 1LT          2.990

        TOTAL A PAGAR: $4.580
      `;

      const result = parseChileanReceipt(text);
      expect(result.total).toBe('4580');
      expect(result.store).toBe('JUMBO');
    });

    test('debe extraer RUT chileno', () => {
      const text = `
        FARMACIA CRUZ VERDE
        RUT: 96.921.230-K
        SUCURSAL PROVIDENCIA

        PARACETAMOL 500MG       1.990
        TOTAL                  $1.990
      `;

      const result = parseChileanReceipt(text);
      expect(result.rut).toBe('96.921.230-K');
      expect(result.store).toBe('CRUZ VERDE');
      expect(result.suggestedCategory).toBe('salud');
    });

    test('debe parsear fecha formato DD/MM/YYYY', () => {
      const text = `
        SUPERMERCADO UNIMARC
        FECHA: 15/03/2024
        TOTAL: $5.990
      `;

      const result = parseChileanReceipt(text);
      expect(result.date).toBe('2024-03-15');
    });

    test('debe parsear fecha formato DD-MM-YY', () => {
      const text = `
        TIENDA XYZ
        FECHA: 15-03-24
        TOTAL: $2.500
      `;

      const result = parseChileanReceipt(text);
      expect(result.date).toBe('2024-03-15');
    });

    test('debe extraer items de la boleta', () => {
      const text = `
        SANTA ISABEL

        1 COCA COLA 2LT          2.190
        2 GALLETAS MCKAY         1.490
        1 YOGURT SOPROLE         990

        TOTAL                   $4.670
      `;

      const result = parseChileanReceipt(text);
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0]).toHaveProperty('name');
      expect(result.items[0]).toHaveProperty('price');
    });

    test('debe detectar gasolinera COPEC', () => {
      const text = `
        COPEC
        ESTACION DE SERVICIO
        RUT: 99.520.000-7

        BENCINA 95          $45.990
        TOTAL              $45.990
      `;

      const result = parseChileanReceipt(text);
      expect(result.store).toBe('COPEC');
      expect(result.suggestedCategory).toBe('transporte');
    });

    test('debe detectar tienda de tecnología', () => {
      const text = `
        PC FACTORY
        BOLETA ELECTRONICA

        MOUSE LOGITECH         15.990
        TOTAL                 $15.990
      `;

      const result = parseChileanReceipt(text);
      expect(result.store).toBe('PC FACTORY');
      expect(result.suggestedCategory).toBe('servicios');
    });

    test('debe manejar texto sin tienda conocida', () => {
      const text = `
        MINIMARKET DON PEPE
        SUCURSAL CENTRO

        VARIOS PRODUCTOS
        TOTAL: $3.500
      `;

      const result = parseChileanReceipt(text);
      expect(result.store.length).toBeGreaterThan(0);
      expect(result.total).toBe('3500');
    });

    test('debe ignorar valores de total inválidos', () => {
      const text = `
        TIENDA TEST

        PRODUCTO              50
        TOTAL:               $50
      `;

      const result = parseChileanReceipt(text);
      // 50 es menor a 100, debería ser ignorado
      expect(result.total).toBe('');
    });

    test('debe generar descripción automática', () => {
      const text = `
        LIDER

        1 LECHE              1.290
        2 PAN                2.490
        1 QUESO              3.990
        1 JAMON              4.990

        TOTAL              $12.760
      `;

      const result = parseChileanReceipt(text);
      expect(result.description.length).toBeGreaterThan(0);
    });
  });

  describe('detectCategory', () => {
    test('debe detectar categoría de supermercado', () => {
      expect(detectCategory('LIDER EXPRESS')).toBe('alimentacion');
      expect(detectCategory('JUMBO KENNEDY')).toBe('alimentacion');
      expect(detectCategory('UNIMARC')).toBe('alimentacion');
    });

    test('debe detectar categoría de farmacia', () => {
      expect(detectCategory('FARMACIA CRUZ VERDE')).toBe('salud');
      expect(detectCategory('FARMACIAS AHUMADA')).toBe('salud');
      expect(detectCategory('SALCOBRAND')).toBe('salud');
    });

    test('debe detectar categoría de gasolinera', () => {
      expect(detectCategory('COPEC')).toBe('transporte');
      expect(detectCategory('SHELL')).toBe('transporte');
      expect(detectCategory('PETROBRAS')).toBe('transporte');
    });

    test('debe detectar categoría de retail', () => {
      expect(detectCategory('FALABELLA')).toBe('ropa');
      expect(detectCategory('RIPLEY')).toBe('ropa');
      expect(detectCategory('PARIS')).toBe('ropa');
    });

    test('debe detectar categoría de ferretería', () => {
      expect(detectCategory('SODIMAC')).toBe('hogar');
      expect(detectCategory('EASY')).toBe('hogar');
    });

    test('debe retornar otro para tiendas desconocidas', () => {
      expect(detectCategory('TIENDA RANDOM XYZ')).toBe('otro');
    });

    test('debe detectar por palabras clave', () => {
      expect(detectCategory('RESTAURANT EL BUENO')).toBe('alimentacion');
      expect(detectCategory('CINE HOYTS')).toBe('entretenimiento');
      expect(detectCategory('LIBRERIA ANTÁRTICA')).toBe('educacion');
    });
  });

  describe('formatCLP', () => {
    test('debe formatear pesos chilenos correctamente', () => {
      expect(formatCLP(1000)).toBe('$1.000');
      expect(formatCLP(15990)).toBe('$15.990');
      expect(formatCLP(1500000)).toBe('$1.500.000');
    });

    test('debe manejar valores pequeños', () => {
      expect(formatCLP(100)).toBe('$100');
      expect(formatCLP(50)).toBe('$50');
    });

    test('debe manejar strings numéricos', () => {
      expect(formatCLP('15990')).toBe('$15.990');
    });
  });

  describe('detectCategoryByProducts', () => {
    test('debe detectar categoría salud por medicamentos', () => {
      const items = [
        { name: 'PARACETAMOL 500MG', price: 1990 },
        { name: 'IBUPROFENO 400MG', price: 2490 }
      ];
      const text = 'FARMACIA XYZ\nPARACETAMOL 500MG 1.990\nIBUPROFENO 400MG 2.490';

      const result = detectCategoryByProducts(items, text);
      expect(result.category).toBe('salud');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.matchedProducts.length).toBeGreaterThan(0);
    });

    test('debe detectar categoría alimentacion por productos de supermercado', () => {
      const items = [
        { name: 'LECHE LONCOLECHE', price: 1290 },
        { name: 'PAN MOLDE', price: 2490 },
        { name: 'QUESO GAUDA', price: 3990 }
      ];
      const text = 'SUPERMERCADO\nLECHE LONCOLECHE 1.290\nPAN MOLDE 2.490\nQUESO GAUDA 3.990';

      const result = detectCategoryByProducts(items, text);
      expect(result.category).toBe('alimentacion');
    });

    test('debe detectar categoría transporte por combustible', () => {
      const items = [
        { name: 'BENCINA 95', price: 45990 }
      ];
      const text = 'ESTACION DE SERVICIO\nBENCINA 95 OCTANOS $45.990';

      const result = detectCategoryByProducts(items, text);
      expect(result.category).toBe('transporte');
    });

    test('debe detectar categoría hogar por productos de limpieza', () => {
      const items = [
        { name: 'DETERGENTE OMO', price: 5990 },
        { name: 'CLORO CLOROX', price: 2990 },
        { name: 'PAPEL HIGIENICO', price: 4990 }
      ];
      const text = 'TIENDA\nDETERGENTE OMO 5.990\nCLORO CLOROX 2.990\nPAPEL HIGIENICO 4.990';

      const result = detectCategoryByProducts(items, text);
      expect(result.category).toBe('hogar');
    });

    test('debe retornar otro si no encuentra productos conocidos', () => {
      const items = [
        { name: 'PRODUCTO XYZ', price: 1000 }
      ];
      const text = 'TIENDA RANDOM\nPRODUCTO XYZ 1.000';

      const result = detectCategoryByProducts(items, text);
      expect(result.category).toBe('otro');
      expect(result.confidence).toBe(0);
    });

    test('debe priorizar productos sobre tienda en parseChileanReceipt', () => {
      // Comprar medicamentos en un supermercado debería dar categoría salud
      const text = `
        LIDER EXPRESS
        RUT: 96.874.030-K

        PARACETAMOL 500MG       1.990
        IBUPROFENO 400MG        2.490
        VITAMINA C              3.990

        TOTAL                  $8.470
      `;

      const result = parseChileanReceipt(text);
      // Aunque es Lider (supermercado), los productos son de salud
      expect(result.suggestedCategory).toBe('salud');
      expect(result.categorySource).toBe('productos');
    });

    test('debe detectar categoría ropa por prendas de vestir', () => {
      const items = [
        { name: 'POLERA MANGA CORTA', price: 9990 },
        { name: 'JEANS SLIM FIT', price: 29990 }
      ];
      const text = 'TIENDA ROPA\nPOLERA MANGA CORTA 9.990\nJEANS SLIM FIT 29.990';

      const result = detectCategoryByProducts(items, text);
      expect(result.category).toBe('ropa');
    });

    test('debe detectar categoría entretenimiento por servicios de streaming', () => {
      const items = [];
      const text = 'COBRO MENSUAL\nNETFLIX PREMIUM $15.990\nSPOTIFY FAMILIAR $8.990';

      const result = detectCategoryByProducts(items, text);
      expect(result.category).toBe('entretenimiento');
    });

    test('debe detectar categoría educacion por útiles escolares', () => {
      const items = [
        { name: 'CUADERNO UNIVERSITARIO', price: 1990 },
        { name: 'LAPIZ PASTA', price: 490 },
        { name: 'GOMA DE BORRAR', price: 290 }
      ];
      const text = 'LIBRERIA\nCUADERNO UNIVERSITARIO 1.990\nLAPIZ PASTA 490\nGOMA DE BORRAR 290';

      const result = detectCategoryByProducts(items, text);
      expect(result.category).toBe('educacion');
    });
  });
});
