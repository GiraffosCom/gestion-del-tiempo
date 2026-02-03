/**
 * Servicio OCR optimizado para boletas chilenas
 * @module services/ocr
 */

/**
 * Comercios chilenos conocidos para mejor detección
 */
const CHILEAN_STORES = {
  supermarkets: [
    'LIDER', 'JUMBO', 'SANTA ISABEL', 'TOTTUS', 'UNIMARC', 'ACUENTA',
    'BIGGER', 'EKONO', 'MAYORISTA 10', 'CENTRAL MAYORISTA', 'ALVI',
    'OK MARKET', 'OXXO', 'BIG JOHN', 'MONTSERRAT', 'SUPER BODEGA'
  ],
  retail: [
    'FALABELLA', 'RIPLEY', 'PARIS', 'LA POLAR', 'HITES', 'ABC DIN',
    'CORONA', 'TRICOT', 'FASHION PARK', 'JOHNSON'
  ],
  pharmacies: [
    'CRUZ VERDE', 'AHUMADA', 'SALCOBRAND', 'DR SIMI', 'KNOP',
    'FARMACIA MAPUCHE', 'FARMACIAS DEL DR'
  ],
  gasStations: [
    'COPEC', 'SHELL', 'PETROBRAS', 'TERPEL', 'ENEX', 'ARAMCO'
  ],
  fastFood: [
    'MCDONALDS', 'MC DONALDS', 'BURGER KING', 'STARBUCKS', 'DUNKIN',
    'SUBWAY', 'KFC', 'PAPA JOHNS', 'PIZZA HUT', 'DOMINOS', 'TELEPIZZA',
    'DOGGIS', 'TARRAGONA', 'JUAN MAESTRO', 'LOMITOS'
  ],
  convenience: [
    'PRONTO', 'PUNTO', 'SPACIO 1', 'GLOBO', 'ON THE RUN'
  ],
  hardware: [
    'SODIMAC', 'EASY', 'CONSTRUMART', 'MTS', 'IMPERIAL', 'FERRETERIA'
  ],
  tech: [
    'PCFACTORY', 'PC FACTORY', 'WEPLASH', 'SOLOTODO', 'REIFSTORE',
    'MACSTORE', 'ISHOP', 'MOVISTAR', 'ENTEL', 'WOM', 'CLARO'
  ]
};

/**
 * Categorías automáticas basadas en el comercio
 */
const STORE_CATEGORIES = {
  supermarkets: 'alimentacion',
  retail: 'ropa',
  pharmacies: 'salud',
  gasStations: 'transporte',
  fastFood: 'alimentacion',
  convenience: 'alimentacion',
  hardware: 'hogar',
  tech: 'servicios'
};

/**
 * Palabras clave de productos para detectar categoría
 */
const PRODUCT_KEYWORDS = {
  alimentacion: [
    // Lácteos
    'LECHE', 'YOGURT', 'YOGHURT', 'QUESO', 'MANTEQUILLA', 'CREMA', 'QUESILLO',
    // Carnes
    'POLLO', 'CARNE', 'CERDO', 'PAVO', 'JAMON', 'SALCHICHA', 'VIENESA', 'LONGANIZA',
    'CHORIZO', 'TOCINO', 'COSTILLA', 'FILETE', 'MOLIDA', 'CHULETA',
    // Panadería
    'PAN', 'MARRAQUETA', 'HALLULLA', 'INTEGRAL', 'MOLDE',
    // Frutas y verduras
    'MANZANA', 'PLATANO', 'BANANA', 'NARANJA', 'LIMON', 'TOMATE', 'LECHUGA',
    'PAPA', 'CEBOLLA', 'ZANAHORIA', 'PALTA', 'UVA', 'FRUTILLA', 'SANDIA',
    // Abarrotes
    'ARROZ', 'FIDEO', 'PASTA', 'TALLARINES', 'SPAGUETTI', 'ACEITE', 'AZUCAR',
    'SAL', 'HARINA', 'ATUN', 'CONSERVA', 'SALSA', 'MAYONESA', 'KETCHUP', 'MOSTAZA',
    // Bebidas
    'COCA', 'PEPSI', 'FANTA', 'SPRITE', 'AGUA', 'MINERAL', 'JUGO', 'NECTAR',
    'CERVEZA', 'VINO', 'PISCO', 'BEBIDA', 'GASEOSA', 'ENERGETICA',
    // Snacks
    'GALLETA', 'CHOCOLATE', 'CARAMELO', 'PAPA FRITA', 'CHIPS', 'RAMITAS', 'DORITOS',
    'CEREAL', 'BARRA', 'HELADO', 'MANI',
    // Comida preparada
    'PIZZA', 'EMPANADA', 'SANDWICH', 'SUSHI', 'ENSALADA', 'ALMUERZO', 'MENU',
    'COMBO', 'HAMBURGUESA', 'COMPLETO', 'HOTDOG'
  ],
  salud: [
    // Medicamentos comunes
    'PARACETAMOL', 'IBUPROFENO', 'ASPIRINA', 'TAPSIN', 'KITADOL', 'ZALDIAR',
    'NASTIZOL', 'ANTIFLU', 'PROPOLEO', 'VITAMINA', 'OMEPRAZOL', 'LORATADINA',
    'CLONAZEPAM', 'ALPRAZOLAM', 'SERTRALINA', 'LOSARTAN', 'ATORVASTATINA',
    'METFORMINA', 'EUTIROX', 'LEVOTIROXINA', 'ANTICONCEPTIVO',
    // Categorías médicas
    'MEDICAMENTO', 'FARMACO', 'REMEDIO', 'ANTIBIOTICO', 'ANALGESICO',
    'ANTIINFLAMATORIO', 'ANTIHISTAMINICO', 'ANTIACIDO', 'LAXANTE',
    // Cuidado personal médico
    'TERMOMETRO', 'JERINGA', 'ALCOHOL', 'GASA', 'VENDA', 'PARCHE', 'CURITA',
    'MASCARILLA', 'GUANTE', 'SUERO', 'INHALADOR',
    // Suplementos
    'SUPLEMENTO', 'PROTEINA', 'CREATINA', 'COLAGENO', 'OMEGA', 'PROBIOTICO',
    'MULTIVITAMINICO', 'CALCIO', 'HIERRO', 'MAGNESIO', 'ZINC'
  ],
  transporte: [
    // Combustibles
    'BENCINA', 'GASOLINA', 'DIESEL', 'PETROLEO', 'GAS', 'COMBUSTIBLE',
    'OCTANO', '93', '95', '97',
    // Servicios auto
    'LUBRICANTE', 'ACEITE MOTOR', 'FILTRO', 'NEUMATICO', 'LLANTA',
    'LAVADO', 'ESTACIONAMIENTO', 'PEAJE', 'TAG', 'AUTOPISTA',
    // Transporte público
    'PASAJE', 'BOLETO', 'METRO', 'MICRO', 'BUS', 'TRANSANTIAGO', 'RED', 'BIP',
    'UBER', 'DIDI', 'CABIFY', 'TAXI', 'TRANSFER'
  ],
  hogar: [
    // Limpieza
    'DETERGENTE', 'LAVALOZA', 'CLORO', 'DESINFECTANTE', 'LIMPIADOR',
    'ESCOBA', 'TRAPERO', 'ESPONJA', 'PAPEL HIGIENICO', 'SERVILLETA', 'TOALLA NOVA',
    'SUAVIZANTE', 'QUITAMANCHAS', 'AROMATIZANTE', 'AMBIENTADOR',
    // Cocina
    'OLLA', 'SARTEN', 'PLATO', 'VASO', 'TAZA', 'CUBIERTO', 'CUCHILLO',
    // Ferretería
    'TORNILLO', 'CLAVO', 'PINTURA', 'BROCHA', 'MARTILLO', 'DESTORNILLADOR',
    'TALADRO', 'CABLE', 'ENCHUFE', 'AMPOLLETA', 'LED', 'FOCO',
    // Muebles y decoración
    'MUEBLE', 'SILLA', 'MESA', 'ESTANTE', 'CORTINA', 'ALFOMBRA', 'COJIN'
  ],
  ropa: [
    // Prendas
    'POLERA', 'CAMISA', 'PANTALON', 'JEANS', 'SHORT', 'FALDA', 'VESTIDO',
    'CHAQUETA', 'POLAR', 'PARKA', 'CHALECO', 'SWEATER', 'POLERON',
    'ROPA INTERIOR', 'CALZON', 'CALZONCILLO', 'SOSTEN', 'CALCETINES', 'MEDIAS',
    // Calzado
    'ZAPATO', 'ZAPATILLA', 'SANDALIA', 'BOTA', 'TACO', 'ALPARGATA',
    // Accesorios
    'CINTURON', 'CARTERA', 'BOLSO', 'MOCHILA', 'BILLETERA', 'GORRO', 'BUFANDA',
    'GUANTES', 'RELOJ', 'LENTES', 'ANTEOJOS'
  ],
  entretenimiento: [
    // Cine y espectáculos
    'ENTRADA', 'CINE', 'PELICULA', 'FUNCION', 'TEATRO', 'CONCIERTO', 'SHOW',
    'ESPECTACULO', 'CIRCO', 'MUSEO', 'EXHIBICION',
    // Juegos
    'VIDEOJUEGO', 'JUEGO', 'PLAYSTATION', 'XBOX', 'NINTENDO', 'STEAM',
    'SPOTIFY', 'NETFLIX', 'DISNEY', 'HBO', 'AMAZON PRIME', 'SUSCRIPCION',
    // Deportes y recreación
    'GIMNASIO', 'GYM', 'PISCINA', 'CANCHA', 'BOWLING', 'KARAOKE',
    'ARRIENDO', 'BICICLETA', 'SKATE'
  ],
  educacion: [
    // Útiles escolares
    'CUADERNO', 'LAPIZ', 'LAPICERA', 'BOLIGRAFO', 'GOMA', 'CORRECTOR',
    'REGLA', 'COMPAS', 'TIJERA', 'PEGAMENTO', 'CARPETA', 'ARCHIVADOR',
    'DESTACADOR', 'PLUMON', 'MARCADOR',
    // Libros
    'LIBRO', 'TEXTO', 'DICCIONARIO', 'ENCICLOPEDIA', 'REVISTA', 'DIARIO',
    // Cursos y educación
    'MATRICULA', 'ARANCEL', 'MENSUALIDAD', 'CURSO', 'TALLER', 'CLASE',
    'CERTIFICACION', 'DIPLOMA', 'EXAMEN', 'FOTOCOPIAS', 'IMPRESION', 'ANILLADO'
  ],
  servicios: [
    // Telecomunicaciones
    'TELEFONO', 'CELULAR', 'PLAN', 'PREPAGO', 'RECARGA', 'GIGAS', 'INTERNET',
    'WIFI', 'FIBRA', 'CABLE', 'TELEVISION',
    // Servicios básicos
    'LUZ', 'ELECTRICIDAD', 'AGUA', 'GAS NATURAL', 'CALEFACCION',
    // Tecnología
    'COMPUTADOR', 'NOTEBOOK', 'LAPTOP', 'TABLET', 'IPAD', 'MOUSE', 'TECLADO',
    'MONITOR', 'PANTALLA', 'AUDIFONOS', 'PARLANTE', 'CARGADOR', 'CABLE USB',
    'PENDRIVE', 'DISCO DURO', 'MEMORIA', 'IMPRESORA', 'TINTA', 'TONER',
    // Servicios profesionales
    'CONSULTA', 'ASESORIA', 'NOTARIA', 'TRAMITE', 'CERTIFICADO'
  ],
  belleza: [
    // Cuidado personal
    'SHAMPOO', 'ACONDICIONADOR', 'JABON', 'GEL', 'DESODORANTE', 'PERFUME',
    'COLONIA', 'CREMA', 'LOCION', 'BLOQUEADOR', 'PROTECTOR SOLAR',
    // Maquillaje
    'MAQUILLAJE', 'BASE', 'POLVO', 'RUBOR', 'SOMBRA', 'RIMEL', 'MASCARA',
    'LABIAL', 'LIPSTICK', 'DELINEADOR', 'ESMALTE', 'UÑA',
    // Servicios de belleza
    'CORTE', 'PEINADO', 'TINTURA', 'MECHAS', 'MANICURE', 'PEDICURE',
    'DEPILACION', 'TRATAMIENTO', 'FACIAL', 'MASAJE', 'SPA', 'PELUQUERIA'
  ]
};

/**
 * Preprocesa la imagen para mejorar el OCR
 * @param {string|HTMLImageElement|File} imageSource - Imagen a procesar
 * @returns {Promise<string>} - Data URL de la imagen procesada
 */
export async function preprocessImage(imageSource) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Escalar si es muy grande (máximo 2000px de ancho)
      let width = img.width;
      let height = img.height;
      const maxWidth = 2000;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen original
      ctx.drawImage(img, 0, 0, width, height);

      // Obtener datos de imagen
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Convertir a escala de grises y aumentar contraste
      for (let i = 0; i < data.length; i += 4) {
        // Escala de grises
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

        // Aumentar contraste (factor 1.5)
        const contrast = 1.5;
        const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
        let newGray = factor * (gray - 128) + 128;

        // Binarización adaptativa (umbral)
        newGray = newGray > 140 ? 255 : (newGray < 80 ? 0 : newGray);

        // Clamp values
        newGray = Math.max(0, Math.min(255, newGray));

        data[i] = newGray;     // R
        data[i + 1] = newGray; // G
        data[i + 2] = newGray; // B
        // Alpha stays the same
      }

      ctx.putImageData(imageData, 0, 0);

      // Aplicar sharpening básico
      const sharpened = sharpenImage(ctx, width, height);
      ctx.putImageData(sharpened, 0, 0);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Error cargando imagen'));

    // Handle different input types
    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.onerror = reject;
      reader.readAsDataURL(imageSource);
    } else if (imageSource instanceof HTMLImageElement) {
      img.src = imageSource.src;
    }
  });
}

/**
 * Aplica filtro de sharpening a la imagen
 */
function sharpenImage(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);

  // Kernel de sharpening
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const kidx = ((y + ky) * width + (x + kx)) * 4;
          sum += copy[kidx] * kernel[(ky + 1) * 3 + (kx + 1)];
        }
      }

      data[idx] = data[idx + 1] = data[idx + 2] = Math.max(0, Math.min(255, sum));
    }
  }

  return imageData;
}

/**
 * Procesa una imagen de boleta con OCR
 * @param {string|File|HTMLImageElement} image - Imagen a procesar
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<Object>} - Datos extraídos de la boleta
 */
export async function processReceipt(image, onProgress = () => {}) {
  // Preprocesar imagen
  onProgress({ status: 'Optimizando imagen...', progress: 0.1 });
  const processedImage = await preprocessImage(image);

  // Verificar que Tesseract esté disponible
  if (typeof Tesseract === 'undefined') {
    throw new Error('Tesseract.js no está cargado');
  }

  onProgress({ status: 'Iniciando reconocimiento...', progress: 0.2 });

  // Ejecutar OCR con configuración optimizada para boletas
  const result = await Tesseract.recognize(
    processedImage,
    'spa',
    {
      logger: m => {
        if (m.status === 'recognizing text') {
          onProgress({
            status: `Procesando: ${Math.round(m.progress * 100)}%`,
            progress: 0.2 + m.progress * 0.6
          });
        }
      },
      // Configuración optimizada para boletas
      tessedit_pageseg_mode: '6', // Assume uniform block of text
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$.,:-/áéíóúñÁÉÍÓÚÑ ',
      preserve_interword_spaces: '1'
    }
  );

  onProgress({ status: 'Analizando texto...', progress: 0.85 });

  const text = result.data.text;
  console.log('[OCR] Texto extraído:', text);

  // Parsear el texto de la boleta
  const parsed = parseChileanReceipt(text);

  onProgress({ status: 'Completado', progress: 1 });

  return {
    raw: text,
    ...parsed,
    confidence: result.data.confidence
  };
}

/**
 * Parsea el texto de una boleta chilena
 * @param {string} text - Texto OCR
 * @returns {Object} - Datos estructurados
 */
export function parseChileanReceipt(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const upperText = text.toUpperCase();

  let store = '';
  let rut = '';
  let total = '';
  let date = '';
  let items = [];
  let suggestedCategory = 'otro';

  console.log('[OCR] Líneas:', lines);

  // 1. Buscar RUT chileno (XX.XXX.XXX-X)
  const rutPatterns = [
    /RUT[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK])/i,
    /R\.U\.T[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK])/i,
    /(\d{1,2}\.\d{3}\.\d{3}-[\dkK])/
  ];

  for (const pattern of rutPatterns) {
    const match = text.match(pattern);
    if (match) {
      rut = match[1].toUpperCase();
      break;
    }
  }

  // 2. Detectar tienda conocida
  for (const [category, stores] of Object.entries(CHILEAN_STORES)) {
    for (const storeName of stores) {
      if (upperText.includes(storeName)) {
        store = storeName;
        suggestedCategory = STORE_CATEGORIES[category] || 'otro';
        break;
      }
    }
    if (store) break;
  }

  // 3. Si no se encontró tienda conocida, buscar por patrones
  if (!store) {
    const storePatterns = [
      /(?:RAZON\s*SOCIAL|EMPRESA|COMERCIO|SUCURSAL)[:\s]*([A-ZÁÉÍÓÚÑ\s]+)/i,
      /^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{3,30})$/m  // Línea solo con mayúsculas (nombre de tienda)
    ];

    for (const pattern of storePatterns) {
      const match = text.match(pattern);
      if (match) {
        const candidate = match[1].trim();
        // Validar que no sea una palabra reservada
        if (!/(BOLETA|FACTURA|ELECTRONICA|RUT|FECHA|TOTAL|IVA|NETO)/i.test(candidate) && candidate.length > 3) {
          store = candidate;
          break;
        }
      }
    }
  }

  // 4. Fallback: usar primera línea que parezca nombre
  if (!store) {
    for (const line of lines.slice(0, 5)) {
      const clean = line.replace(/[^A-ZÁÉÍÓÚÑ\s]/gi, '').trim();
      if (clean.length > 3 && clean.length < 40 &&
          !/(BOLETA|FACTURA|ELECTRONICA|RUT|FECHA|TOTAL)/i.test(clean)) {
        store = clean;
        break;
      }
    }
  }

  // 5. Buscar TOTAL (múltiples patrones chilenos)
  // Primero eliminar líneas de SUBTOTAL para evitar confusión
  const textWithoutSubtotal = text.replace(/SUBTOTAL[^\n]*/gi, '');

  const totalPatterns = [
    // Patrones específicos de boletas chilenas
    /TOTAL\s*A\s*PAGAR\s*[:\s]*\$?\s*([\d.,]+)/i,
    /TOTAL\s*\$?\s*([\d]+\.[\d]{3}(?:\.[\d]{3})*)/i,  // TOTAL $15.990
    /(?<!SUB)TOTAL\s*[:\s]*\$?\s*([\d.,]+)/i,  // TOTAL pero no SUBTOTAL
    /MONTO\s*TOTAL\s*[:\s]*\$?\s*([\d.,]+)/i,
    /VALOR\s*TOTAL\s*[:\s]*\$?\s*([\d.,]+)/i,
    /IMPORTE\s*TOTAL\s*[:\s]*\$?\s*([\d.,]+)/i,
    /T\s*O\s*T\s*A\s*L\s*[:\s]*\$?\s*([\d.,]+)/i,  // T O T A L (espaciado)
    /\$\s*([\d]{1,3}(?:\.[\d]{3})+)\s*$/m,  // $15.990 al final de línea
    /(?<!SUB)TOTAL[:\s]+(\d{1,3}(?:\.\d{3})*)\s*$/im
  ];

  for (const pattern of totalPatterns) {
    const match = textWithoutSubtotal.match(pattern);
    if (match) {
      // Convertir formato chileno (15.990) a número (15990)
      total = match[1].replace(/\./g, '').replace(/,/g, '');
      // Validar que sea un número razonable (entre 100 y 10.000.000)
      const numTotal = parseInt(total);
      if (numTotal >= 100 && numTotal <= 10000000) {
        console.log('[OCR] Total encontrado:', match[1], '->', total);
        break;
      }
      total = ''; // Reset if invalid
    }
  }

  // 6. Buscar fecha (formatos chilenos)
  const datePatterns = [
    // Formatos ISO y estándar
    /FECHA\s*(?:EMISION|EMI)?[:\s]*(\d{4})-(\d{2})-(\d{2})/i,
    /FECHA[:\s]*(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i,
    /FECHA[:\s]*(\d{2})[\/\-](\d{2})[\/\-](\d{2})\b/i,
    // Formato sin etiqueta
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,
    /(\d{2})[\/\-](\d{2})[\/\-](\d{2})\b/,
    // Formato con mes en texto
    /(\d{1,2})\s+(?:de\s+)?(ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC)[A-Z]*\s+(?:de\s+)?(\d{2,4})/i,
    /(\d{1,2})\s+(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\s+(\d{2,4})/i
  ];

  const monthMap = {
    'ene': '01', 'enero': '01',
    'feb': '02', 'febrero': '02',
    'mar': '03', 'marzo': '03',
    'abr': '04', 'abril': '04',
    'may': '05', 'mayo': '05',
    'jun': '06', 'junio': '06',
    'jul': '07', 'julio': '07',
    'ago': '08', 'agosto': '08',
    'sep': '09', 'septiembre': '09',
    'oct': '10', 'octubre': '10',
    'nov': '11', 'noviembre': '11',
    'dic': '12', 'diciembre': '12'
  };

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      let day, month, year;

      if (match[1].length === 4) {
        // Formato YYYY-MM-DD
        year = match[1];
        month = match[2];
        day = match[3];
      } else if (isNaN(parseInt(match[2]))) {
        // Formato con mes en texto
        day = match[1].padStart(2, '0');
        month = monthMap[match[2].toLowerCase().substring(0, 3)] || monthMap[match[2].toLowerCase()];
        year = match[3].length === 2 ? '20' + match[3] : match[3];
      } else {
        // Formato DD/MM/YY o DD/MM/YYYY
        day = match[1].padStart(2, '0');
        month = match[2].padStart(2, '0');
        year = match[3].length === 2 ? '20' + match[3] : match[3];
      }

      // Validar fecha
      if (day && month && year &&
          parseInt(day) >= 1 && parseInt(day) <= 31 &&
          parseInt(month) >= 1 && parseInt(month) <= 12) {
        date = `${year}-${month}-${day}`;
        console.log('[OCR] Fecha encontrada:', match[0], '->', date);
        break;
      }
    }
  }

  // 7. Extraer items (productos con precios)
  const itemPatterns = [
    // Cantidad + Descripción + Precio
    /^\s*(\d+)\s+([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ\s\d.]+?)\s+\$?([\d.,]+)\s*$/,
    // Descripción + Precio (sin cantidad)
    /^\s*([A-ZÁÉÍÓÚÑ][A-Za-záéíóúñ\s\d.]{3,30}?)\s+\$?([\d]{1,3}(?:\.[\d]{3})+)\s*$/,
    // Código + Descripción + Precio
    /^\s*[\d]+\s+([A-Za-záéíóúñ\s\d.]+?)\s+\$?([\d.,]+)\s*$/
  ];

  const excludeKeywords = [
    'total', 'subtotal', 'iva', 'neto', 'rut', 'boleta', 'factura',
    'fecha', 'hora', 'cantidad', 'precio', 'descuento', 'vuelto',
    'efectivo', 'tarjeta', 'debito', 'credito', 'cambio', 'pago'
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Saltar líneas con palabras clave
    if (excludeKeywords.some(kw => lowerLine.includes(kw))) continue;

    for (const pattern of itemPatterns) {
      const match = line.match(pattern);
      if (match) {
        let itemName, itemPrice;

        if (match.length === 4) {
          // Con cantidad
          itemName = match[2].trim();
          itemPrice = match[3];
        } else {
          // Sin cantidad
          itemName = match[1].trim();
          itemPrice = match[2];
        }

        // Validar item
        if (itemName.length > 2 && itemName.length < 50) {
          const priceNum = parseInt(itemPrice.replace(/\./g, '').replace(/,/g, ''));
          if (priceNum >= 10 && priceNum <= 1000000) {
            items.push({
              name: itemName,
              price: priceNum,
              priceFormatted: `$${priceNum.toLocaleString('es-CL')}`
            });
          }
        }
        break;
      }
    }
  }

  // Limitar a 20 items máximo
  items = items.slice(0, 20);

  // 8. Generar descripción automática
  let description = '';
  if (items.length > 0) {
    description = items.slice(0, 3).map(i => i.name).join(', ');
    if (items.length > 3) {
      description += ` (+${items.length - 3} más)`;
    }
  }

  // 9. Detectar categoría por productos (prioridad sobre tienda)
  const productCategory = detectCategoryByProducts(items, text);
  let finalCategory = suggestedCategory;
  let categorySource = 'tienda';
  let matchedProducts = [];

  // Si la detección por productos tiene buena confianza, usarla
  if (productCategory.confidence >= 30) {
    finalCategory = productCategory.category;
    categorySource = 'productos';
    matchedProducts = productCategory.matchedProducts;
    console.log('[OCR] Categoría por productos:', finalCategory, 'confianza:', productCategory.confidence, '%');
  } else if (suggestedCategory !== 'otro') {
    console.log('[OCR] Categoría por tienda:', finalCategory);
  }

  return {
    store: store || '',
    rut,
    total,
    date,
    items,
    description,
    suggestedCategory: finalCategory,
    categorySource,
    matchedProducts,
    productCategoryConfidence: productCategory.confidence
  };
}

/**
 * Detecta la categoría basada en los productos de la boleta
 * @param {Array} items - Items extraídos de la boleta
 * @param {string} fullText - Texto completo de la boleta
 * @returns {{category: string, confidence: number, matchedProducts: string[]}}
 */
export function detectCategoryByProducts(items, fullText) {
  const upperText = fullText.toUpperCase();
  const categoryScores = {};
  const matchedProducts = {};

  // Inicializar scores
  for (const category of Object.keys(PRODUCT_KEYWORDS)) {
    categoryScores[category] = 0;
    matchedProducts[category] = [];
  }

  // Buscar keywords en el texto completo
  for (const [category, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
    for (const keyword of keywords) {
      // Buscar la palabra completa (no como substring de otra)
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = upperText.match(regex);
      if (matches) {
        categoryScores[category] += matches.length;
        if (!matchedProducts[category].includes(keyword)) {
          matchedProducts[category].push(keyword);
        }
      }
    }
  }

  // También buscar en los items extraídos (mayor peso)
  for (const item of items) {
    const itemUpper = item.name.toUpperCase();
    for (const [category, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (itemUpper.includes(keyword)) {
          categoryScores[category] += 2; // Mayor peso para items confirmados
          if (!matchedProducts[category].includes(keyword)) {
            matchedProducts[category].push(keyword);
          }
        }
      }
    }
  }

  // Encontrar la categoría con mayor score
  let maxScore = 0;
  let bestCategory = 'otro';
  let bestMatches = [];

  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
      bestMatches = matchedProducts[category];
    }
  }

  // Calcular confianza (0-100)
  const confidence = Math.min(100, maxScore * 15);

  return {
    category: bestCategory,
    confidence,
    matchedProducts: bestMatches.slice(0, 5) // Máximo 5 productos como ejemplo
  };
}

/**
 * Formatea un monto en pesos chilenos
 * @param {number} amount
 * @returns {string}
 */
export function formatCLP(amount) {
  return `$${parseInt(amount).toLocaleString('es-CL')}`;
}

/**
 * Detecta la categoría sugerida basada en el nombre de la tienda
 * @param {string} storeName
 * @returns {string}
 */
export function detectCategory(storeName) {
  const upper = storeName.toUpperCase();

  for (const [category, stores] of Object.entries(CHILEAN_STORES)) {
    for (const store of stores) {
      if (upper.includes(store)) {
        return STORE_CATEGORIES[category];
      }
    }
  }

  // Detección por palabras clave
  if (/FARMACIA|DROGUERIA|SALUD|MEDIC/i.test(upper)) return 'salud';
  if (/RESTAURANT|COMIDA|CAFE|PIZZA|SUSHI|POLLO/i.test(upper)) return 'alimentacion';
  if (/BENCIN|COMBUSTIBLE|ESTACION|SERVITECA/i.test(upper)) return 'transporte';
  if (/FERRET|CONSTRUC|PINTUR/i.test(upper)) return 'hogar';
  if (/LIBRER|PAPELER|ESCOLAR|UNIVERSIDAD/i.test(upper)) return 'educacion';
  if (/CINE|TEATRO|ENTRETENIM|JUEGO/i.test(upper)) return 'entretenimiento';
  if (/ROPA|VESTIR|ZAPATER|CALZADO|MODA/i.test(upper)) return 'ropa';

  return 'otro';
}

export default {
  processReceipt,
  parseChileanReceipt,
  preprocessImage,
  formatCLP,
  detectCategory,
  detectCategoryByProducts,
  CHILEAN_STORES,
  PRODUCT_KEYWORDS
};
