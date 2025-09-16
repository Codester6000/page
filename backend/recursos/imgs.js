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
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      },
      timeout: 10000, // 10 segundos de timeout
    });

    if (data.results && data.results.length > 0) {
      const producto = data.results[0];
      return (
        producto.secure_thumbnail ||
        producto.thumbnail ||
        (producto.pictures &&
          producto.pictures[0] &&
          producto.pictures[0].secure_url) ||
        null
      );
    }

    console.log("No se encontraron resultados en MercadoLibre");
    return null;
  } catch (error) {
    console.error(
      "Error en la búsqueda ML:",
      error.response?.status,
      error.response?.statusText || error.message
    );
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

  if (url) {
    console.log("✅ Imagen encontrada en MercadoLibre");
    return url;
  }

  console.log("🔍 Buscando en Bing Images...");
  url = await buscaImgBing(nombreProducto);
  console.log(url);

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

// Función de utilidad para validar URLs de imágenes
export async function validarImagen(url) {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const contentType = response.headers["content-type"];
    return contentType && contentType.startsWith("image/");
  } catch (error) {
    console.log(`URL de imagen no válida: ${url}`);
    return false;
  }
}
