import axios from "axios";
import puppeteer from "puppeteer";

// Función mejorada para buscar en MercadoLibre
export async function buscaImgMl(nombreProducto) {
  try {
    const url = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(
      nombreProducto
    )}&limit=1`;

    const { data } = await axios.get(url, {
      headers: {
        // Headers más realistas para evitar detección como bot
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Ch-Ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        // simular que vienes del sitio oficial
        Referer: "https://www.mercadolibre.com.ar/",
        Origin: "https://www.mercadolibre.com.ar",
      },
      timeout: 15000, // Aumentar timeout
      // Validar solo errores de servidor (500+)
      validateStatus: function (status) {
        return status < 500;
      },
    });

    // Verificar si hay error en la respuesta de la API
    if (data.error) {
      console.error("Error en la API de MercadoLibre:", data.error);
      return null;
    }

    if (data.results && data.results.length > 0) {
      const producto = data.results[0];
      const imagen =
        producto.secure_thumbnail ||
        producto.thumbnail ||
        (producto.pictures &&
          producto.pictures[0] &&
          producto.pictures[0].secure_url) ||
        (producto.pictures &&
          producto.pictures[0] &&
          producto.pictures[0].url) ||
        null;

      if (imagen) {
        console.log(`✅ Imagen ML encontrada para "${nombreProducto}"`);
      }
      return imagen;
    }

    console.log("No se encontraron resultados en MercadoLibre");
    return null;
  } catch (error) {
    // Manejo mejorado de errores específicos
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;

      switch (status) {
        case 401:
          console.error(
            "❌ Error 401 - No autorizado en MercadoLibre. Posible detección como bot."
          );
          break;
        case 403:
          console.error(
            "❌ Error 403 - Prohibido en MercadoLibre. IP bloqueada temporalmente."
          );
          break;
        case 429:
          console.error(
            "❌ Error 429 - Demasiadas solicitudes a MercadoLibre."
          );
          break;
        case 503:
          console.error(
            "❌ Error 503 - Servicio de MercadoLibre no disponible."
          );
          break;
        default:
          console.error(`❌ Error ${status} en MercadoLibre - ${statusText}`);
      }
    } else if (error.request) {
      console.error(
        "❌ Error de red en MercadoLibre - Sin respuesta del servidor"
      );
    } else {
      console.error("❌ Error configurando solicitud ML:", error.message);
    }

    return null;
  }
}

// Función alternativa usando fetch para MercadoLibre (si axios falla)
export async function buscaImgMlFetch(nombreProducto) {
  try {
    const url = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(
      nombreProducto
    )}&limit=1`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "es-AR,es;q=0.9",
        Referer: "https://www.mercadolibre.com.ar/",
        "Cache-Control": "no-cache",
      },
      mode: "cors",
    });

    if (!response.ok) {
      console.error(
        `❌ HTTP Error en ML: ${response.status} - ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const producto = data.results[0];
      return (
        producto.secure_thumbnail ||
        producto.thumbnail ||
        (producto.pictures && producto.pictures[0]?.secure_url) ||
        null
      );
    }

    return null;
  } catch (error) {
    console.error("❌ Error en búsqueda ML (fetch):", error.message);
    return null;
  }
}

export async function buscaImgGoogle(nombreProducto) {
  let browser;
  console.log("Iniciando búsqueda en Google Images...");

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Configurar headers para evitar detección
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Configurar viewport
    await page.setViewport({ width: 1280, height: 800 });

    const query = encodeURIComponent(nombreProducto);
    console.log(`Navegando a Google Images con query: ${nombreProducto}`);

    await page.goto(`https://www.google.com/search?tbm=isch&q=${query}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Esperar a que las imágenes se carguen
    await page.waitForSelector("img[alt]", { timeout: 10000 });

    console.log("Buscando URLs de imágenes...");

    // Buscar imágenes de manera más específica
    const imgUrls = await page.evaluate(() => {
      const images = [];

      // Buscar imágenes en los resultados de Google Images
      const imgElements = document.querySelectorAll("img[src]");

      for (const img of imgElements) {
        const src = img.src;

        // Filtrar imágenes válidas (evitar logos, iconos, etc.)
        if (
          src &&
          !src.includes("logo") &&
          !src.includes("icon") &&
          !src.startsWith("data:") &&
          (src.includes("http") || src.includes("https")) &&
          !src.includes("googlelogo") &&
          !src.includes("gstatic.com") &&
          img.width > 100 &&
          img.height > 100
        ) {
          images.push({
            src: src,
            width: img.width,
            height: img.height,
            alt: img.alt || "",
          });
        }
      }

      // Ordenar por tamaño (más grandes primero)
      images.sort((a, b) => b.width * b.height - a.width * a.height);

      return images;
    });

    console.log(`Se encontraron ${imgUrls.length} imágenes candidatas`);

    if (imgUrls.length > 0) {
      console.log("Primera imagen encontrada:", imgUrls[0].src);
      return imgUrls[0].src;
    }

    return null;
  } catch (error) {
    console.error("Error en la búsqueda de Google:", error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser cerrado");
    }
  }
}
// Función alternativa usando Bing (más confiable que Google)
export async function buscaImgBing(nombreProducto) {
  let browser;
  console.log("Iniciando búsqueda en Bing Images...");

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );

    const query = encodeURIComponent(nombreProducto);
    await page.goto(`https://www.bing.com/images/search?q=${query}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForSelector(".iusc", { timeout: 10000 });

    const imgUrl = await page.evaluate(() => {
      const imgContainer = document.querySelector(".iusc");
      if (imgContainer) {
        const imgData = imgContainer.getAttribute("m");
        if (imgData) {
          try {
            const parsedData = JSON.parse(imgData);
            return parsedData.murl || parsedData.turl;
          } catch (e) {
            console.log("Error parsing Bing image data:", e);
          }
        }
      }

      // Fallback: buscar imagen directamente
      const img = document.querySelector(".iusc img");
      return img ? img.src : null;
    });

    return imgUrl;
  } catch (error) {
    console.error("Error en la búsqueda de Bing:", error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function obtenerImgProducto(nombreProducto) {
  console.log(`\n🔍 Buscando imagen para: "${nombreProducto}"`);

  console.log("📦 Buscando en MercadoLibre...");
  let url = await buscaImgMl(nombreProducto);

  // Si falla con axios, intentar con fetch
  if (!url) {
    console.log("📦 Reintentando MercadoLibre con fetch...");
    url = await buscaImgMlFetch(nombreProducto);
  }

  if (url) {
    console.log("✅ Imagen encontrada en MercadoLibre");
    return url;
  }

  console.log("🔍 Buscando en Bing Images...");
  url = await buscaImgBing(nombreProducto);

  if (url) {
    console.log("✅ Imagen encontrada en Bing");
    return url;
  }

  console.log("🔍 Buscando en Google Images (último recurso)...");
  url = await buscaImgGoogle(nombreProducto);

  if (url) {
    console.log("✅ Imagen encontrada en Google");
    return url;
  }

  console.log("❌ No se encontró ninguna imagen");
  return null;
}

// Función de utilidad para validar URLs de imágenes (mejorada)
export async function validarImagen(url) {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      validateStatus: function (status) {
        return status < 400; // Considerar exitoso si es menor a 400
      },
    });

    const contentType = response.headers["content-type"];
    const isValidImage = contentType && contentType.startsWith("image/");

    if (isValidImage) {
      console.log("✅ URL de imagen válida:", url);
    } else {
      console.log("❌ URL no es una imagen válida:", url);
    }

    return isValidImage;
  } catch (error) {
    console.log(`❌ URL de imagen no accesible: ${url} - ${error.message}`);
    return false;
  }
}

// Función adicional para limpiar cache/delay
export async function esperarDelay(ms = 1000) {
  console.log(`⏳ Esperando ${ms}ms...`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Uso con delay entre búsquedas si es necesario:
export async function obtenerImgProductoConDelay(nombreProducto, delay = 1000) {
  const resultado = await obtenerImgProducto(nombreProducto);
  await esperarDelay(delay);
  return resultado;
}
