# Руководство по настройке Backend (Серверной части)

Этот документ содержит пошаговую инструкцию по инициализации и запуску серверной части вашего проекта на базе NestJS.

---

### Предпосылки

Перед началом убедитесь, что вы выполнили шаги из `setup_guide.md`, в частности:
*   Установлен **Node.js** и **NPM**.
*   Установлен **NestJS CLI** (`npm install -g @nestjs/cli`).
*   Работает Docker-контейнер с **PostgreSQL** (запущен командой `docker-compose up -d` в папке с `docker-compose.yml`).

---

### Шаг 1: Создание проекта NestJS

1.  **Откройте терминал** (например, интегрированный терминал VS Code).
2.  **Перейдите в директорию**, где вы хотите создать папку для бэкенда вашего проекта (например, в `C:\Users\makar\Desktop\Diplom` или в подпапку `server`).
3.  **Выполните команду:**
    ```bash
    nest new logistics-api
    ```
    *   `logistics-api` - это имя папки для вашего бэкенда.
    *   В процессе установки NestJS CLI предложит выбрать менеджер пакетов (npm, yarn, pnpm). Выберите `npm`.
    *   Эта команда создаст новую папку `logistics-api` со всей необходимой структурой проекта и установит зависимости.

4.  **Перейдите в созданную папку проекта:**
    ```bash
    cd logistics-api
    ```

---

### Шаг 2: Установка ORM и драйвера БД

NestJS использует ORM (Object-Relational Mapper) для взаимодействия с базой данных. Мы будем использовать **TypeORM**, который хорошо интегрируется с NestJS.

1.  **Установите TypeORM и драйвер PostgreSQL:**
    ```bash
    npm install @nestjs/typeorm typeorm pg
    ```
    *   `@nestjs/typeorm`: Модуль интеграции TypeORM для NestJS.
    *   `typeorm`: Сам TypeORM.
    *   `pg`: Драйвер для PostgreSQL.

---

### Шаг 3: Настройка подключения к базе данных

1.  **Откройте проект `logistics-api` в VS Code.**
2.  **Откройте файл `src/app.module.ts`** (основной модуль приложения).
3.  **Импортируйте `TypeOrmModule`** и настройте подключение к PostgreSQL, используя данные из вашего `docker-compose.yml`.
    **Пример `src/app.module.ts`:**
    ```typescript
    import { Module } from '@nestjs/common';
    import { AppController } from './app.controller';
    import { AppService } from './app.service';
    import { TypeOrmModule } from '@nestjs/typeorm'; // Добавили импорт

    @Module({
      imports: [
        TypeOrmModule.forRoot({ // Настройка подключения к БД
          type: 'postgres',
          host: 'localhost',    // Хост, где запущен Docker-контейнер с PostgreSQL
          port: 5432,           // Порт PostgreSQL
          username: 'admin',    // Имя пользователя из docker-compose.yml
          password: 'admin',    // Пароль из docker-compose.yml
          database: 'logistics_db', // Имя БД из docker-compose.yml
          autoLoadEntities: true, // Автоматическая загрузка сущностей (entities)
          synchronize: true,      // Синхронизация схемы БД. ВНИМАНИЕ: Использовать только на dev-окружении!
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    })
    export class AppModule {}
    ```
    *   **Важно про `synchronize: true`**: Эта опция автоматически создаёт или обновляет таблицы в вашей БД на основе ваших Entity-файлов. Это очень удобно для разработки, но **НИКОГДА не используйте её в продакшене**, чтобы избежать потери данных.

---

### Шаг 4: Создание первого модуля (ресурса)

Создадим пример модуля, чтобы проверить, что всё работает. Пусть это будет ресурс `Request` (Заявка).

1.  **В терминале** (убедитесь, что вы находитесь в папке `logistics-api`) выполните команду:
    ```bash
    nest g resource request
    ```
2.  NestJS CLI спросит: "What transport layer would you like to use?". Выберите `REST API`.
3.  NestJS CLI спросит: "Would you like to generate CRUD entry points?". Выберите `Yes`.
    *   Эта команда сгенерирует для вас файлы: `request.controller.ts`, `request.service.ts`, `request.module.ts`, `request.entity.ts` (сущность БД) и `create-request.dto.ts` / `update-request.dto.ts` (объекты для передачи данных).
    *   NestJS автоматически добавит `RequestModule` в `AppModule`.

---

### Шаг 5: Запуск Backend-сервера

1.  **В терминале** (в папке `logistics-api`) выполните команду:
    ```bash
    npm run start:dev
    ```
    *   Эта команда запустит NestJS-сервер в режиме разработки. Он будет автоматически перезагружаться при изменении файлов (hot-reloading).
    *   Обычно сервер запускается на порту `3000`. Вы увидите сообщение в консоли, например: `[Nest] 12345   - 26/01/2026, 12:00:00 PM     LOG [NestApplication] Nest application successfully started +0ms`.

---

### Шаг 6: Тестирование API (через Swagger UI)

NestJS позволяет легко интегрировать Swagger UI для тестирования вашего API.

1.  **Установите зависимости для Swagger:**
    ```bash
    npm install --save @nestjs/swagger swagger-ui-express
    npm install --save-dev @types/swagger-ui-express
    ```
2.  **Настройте Swagger в файле `src/main.ts`:**
    ```typescript
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Добавили импорт

    async function bootstrap() {
      const app = await NestFactory.create(AppModule);

      // Настройка Swagger
      const config = new DocumentBuilder()
        .setTitle('Logistics API')
        .setDescription('The API for managing logistics services')
        .setVersion('1.0')
        .addTag('requests') // Пример тега
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api', app, document); // Доступно по /api

      await app.listen(3000);
    }
    bootstrap();
    ```
3.  **Перезапустите сервер** (`Ctrl+C` и `npm run start:dev`).
4.  Откройте в браузере `http://localhost:3000/api`. Вы увидите интерактивную документацию Swagger, где сможете тестировать эндпоинты вашего ресурса `Request`.

---

**Поздравляю!** Ваш Backend-сервер NestJS полностью настроен, подключен к базе данных и готов к разработке. Теперь вы можете создавать новые модули и писать логику приложения.
