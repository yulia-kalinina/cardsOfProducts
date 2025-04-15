import {
  copyFileSync,
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Получаем __dirname в ES Modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Конфигурационные параметры
const config = {
  repoName: "cardsOfProducts", // Замените на имя вашего репозитория
  outDir: join(__dirname, "out"),
  staticRoutes: ["/", "/products", "/products/add", "/404"],
  dynamicRoutes: ["/products/[slug]"],
};

// 1. Функция для создания редиректов
const createRedirects = () => {
  try {
    // Для статических маршрутов добавляем trailing slash
    config.staticRoutes.forEach((route) => {
      if (route.endsWith("/")) return;

      const htmlPath = join(config.outDir, `${route}.html`);
      const redirectContent = `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=${route}/">
  <link rel="canonical" href="${route}/" />
</head>
<body>
  Redirecting to <a href="${route}/">${route}/</a>...
</body>
</html>`;

      writeFileSync(htmlPath, redirectContent);
    });
    console.log("✅ Static redirects created");
  } catch (err) {
    console.error("❌ Error creating static redirects:", err);
  }
};

// 2. Функция для обработки динамических маршрутов
const handleDynamicRoutes = () => {
  try {
    config.dynamicRoutes.forEach((route) => {
      const dirPath = join(config.outDir, route.replace("[slug]", "_"));
      mkdirSync(dirPath, { recursive: true });

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <script>
    const slug = window.location.pathname.split('/').pop();
    window.location.href = '/404.html?slug=' + encodeURIComponent(slug);
  </script>
</head>
<body>
  Redirecting...
</body>
</html>`;

      writeFileSync(join(dirPath, "index.html"), htmlContent);
    });
    console.log("✅ Dynamic routes handled");
  } catch (err) {
    console.error("❌ Error handling dynamic routes:", err);
  }
};

// 3. Функция для обновления путей ресурсов
const updateAssetPaths = () => {
  try {
    const processDirectory = (dir) => {
      const files = readdirSync(dir);

      files.forEach((file) => {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          processDirectory(fullPath);
        } else if (
          file.endsWith(".js") ||
          file.endsWith(".html") ||
          file.endsWith(".json")
        ) {
          try {
            let content = readFileSync(fullPath, "utf8");
            content = content.replace(/\/_next/g, `/${config.repoName}/_next`);
            writeFileSync(fullPath, content);
          } catch (err) {
            console.error(`Error processing ${file}:`, err);
          }
        }
      });
    };

    const nextStaticDir = join(config.outDir, "_next");
    if (statSync(nextStaticDir).isDirectory()) {
      processDirectory(nextStaticDir);
      console.log("✅ Asset paths updated");
    }
  } catch (err) {
    console.error("❌ Error updating asset paths:", err);
  }
};

// 4. Главная функция
const main = () => {
  try {
    console.log("🚀 Starting predeploy tasks...");

    // 1. Создаем редиректы
    createRedirects();

    // 2. Обрабатываем динамические маршруты
    handleDynamicRoutes();

    // 3. Копируем 404.html
    copyFileSync(
      join(config.outDir, "404.html"),
      join(config.outDir, "index.html")
    );
    console.log("✅ 404.html copied to index.html");

    // 4. Обновляем пути ресурсов
    updateAssetPaths();

    console.log("🎉 All predeploy tasks completed successfully!");
  } catch (err) {
    console.error("❌ Predeploy failed:", err);
    process.exit(1);
  }
};

// Запускаем скрипт
main();
