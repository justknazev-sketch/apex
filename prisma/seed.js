const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Admin User
  const passwordHash = await bcrypt.hash('ApexForce2026!', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: {
      username: 'admin',
      passwordHash,
    },
  });
  console.log(`Admin user created/updated: ${admin.username}`);

  // 2. Clear existing entries to prevent duplication on re-seed
  await prisma.product.deleteMany({});
  await prisma.color.deleteMany({});
  await prisma.constructorElement.deleteMany({});
  await prisma.contentText.deleteMany({});
  await prisma.seoMetadata.deleteMany({});

  // 3. Seed Colors
  const colorsData = [
    { id: '#2C2C2C', nameUk: 'Чорний', nameRu: 'Черный', nameEn: 'Black' },
    { id: '#9E9E9E', nameUk: 'Сірий', nameRu: 'Серый', nameEn: 'Gray' },
    { id: '#F5F5F5', nameUk: 'Білий', nameRu: 'Белый', nameEn: 'White' },
    { id: '#E53935', nameUk: 'Червоний', nameRu: 'Красный', nameEn: 'Red' },
    { id: '#1565C0', nameUk: 'Синій', nameRu: 'Синий', nameEn: 'Blue' },
    { id: '#2E7D32', nameUk: 'Зелений', nameRu: 'Зеленый', nameEn: 'Green' },
    { id: '#F57F17', nameUk: 'Жовтий', nameRu: 'Желтый', nameEn: 'Yellow' },
    { id: '#6A1B9A', nameUk: 'Фіолетовий', nameRu: 'Фиолетовый', nameEn: 'Purple' },
    { id: '#00838F', nameUk: 'Бірюзовий', nameRu: 'Бирюзовый', nameEn: 'Turquoise' },
    { id: '#4E342E', nameUk: 'Коричневий', nameRu: 'Коричневый', nameEn: 'Brown' },
  ];

  for (const c of colorsData) {
    await prisma.color.create({ data: c });
  }
  console.log('Colors seeded.');

  // 4. Seed Constructor Elements
  const elementsData = [
    { id: 'turnik', nameUk: 'Турнік', nameRu: 'Турник', nameEn: 'Pull-up Bar', price: 1850, icon: '🏋️' },
    { id: 'swedish', nameUk: 'Шведська стінка', nameRu: 'Шведская стенка', nameEn: 'Swedish Wall', price: 7200, icon: '🧗' },
    { id: 'brusy', nameUk: 'Бруси', nameRu: 'Брусья', nameEn: 'Parallel Bars', price: 1290, icon: '🤸' },
    { id: 'press', nameUk: 'Упор для пресу', nameRu: 'Упор для пресса', nameEn: 'Abs Bench', price: 950, icon: ' Seat' },
    { id: 'lava', nameUk: 'Лава', nameRu: 'Скамья', nameEn: 'Workout Bench', price: 2400, icon: '🛋️' },
    { id: 'rope', nameUk: 'Канат', nameRu: 'Канат', nameEn: 'Climbing Rope', price: 600, icon: '🪢' },
  ];

  for (const el of elementsData) {
    await prisma.constructorElement.create({ data: el });
  }
  console.log('Constructor elements seeded.');

  // 5. Seed Products
  const productsData = [
    {
      category: 'street',
      nameUk: 'Вуличний комплекс «Apex Red»',
      nameRu: 'Уличный комплекс «Apex Red»',
      nameEn: 'Street Gym Complex "Apex Red"',
      specsJson: JSON.stringify([['Колір', 'Червоний'], ['Профіль', '80×80 мм'], ['Навантаж.', 'до 250 кг'], ['Комплект', 'Турнік, бруси, лава, штанга']]),
      price: 18900,
      badgeUk: 'Хіт',
      badgeRu: 'Хит',
      badgeEn: 'Best Seller',
      photo: '',
    },
    {
      category: 'street',
      nameUk: 'Вуличний комплекс «Apex Green» Pro',
      nameRu: 'Уличный комплекс «Apex Green» Pro',
      nameEn: 'Street Gym Complex "Apex Green" Pro',
      specsJson: JSON.stringify([['Колір', 'Зелений'], ['Профіль', '80×80 мм'], ['Навантаж.', 'до 300 кг'], ['Комплект', 'Кільця, канат, груша, сітка']]),
      price: 34900,
      badgeUk: 'Топ',
      badgeRu: 'Топ',
      badgeEn: 'Top Choice',
      photo: '',
    },
    {
      category: 'street',
      nameUk: 'Вуличний комплекс «Apex Blue»',
      nameRu: 'Уличный комплекс «Apex Blue»',
      nameEn: 'Street Gym Complex "Apex Blue"',
      specsJson: JSON.stringify([['Колір', 'Синій'], ['Профіль', '80×80 мм'], ['Навантаж.', 'до 250 кг'], ['Комплект', 'Скеледром, кільця, гамак']]),
      price: 29700,
      badgeUk: null,
      badgeRu: null,
      badgeEn: null,
      photo: '',
    },
    {
      category: 'street',
      nameUk: 'Вуличний комплекс «Apex Brown» XL',
      nameRu: 'Уличный комплекс «Apex Brown» XL',
      nameEn: 'Street Gym Complex "Apex Brown" XL',
      specsJson: JSON.stringify([['Колір', 'Коричневий'], ['Профіль', '80×80 мм'], ['Навантаж.', 'до 250 кг'], ['Комплект', 'Баскетбол, рукохід, груша']]),
      price: 27500,
      badgeUk: null,
      badgeRu: null,
      badgeEn: null,
      photo: '',
    },
    {
      category: 'street',
      nameUk: 'Вуличний комплекс «Apex Graphite»',
      nameRu: 'Уличный комплекс «Apex Graphite»',
      nameEn: 'Street Gym Complex "Apex Graphite"',
      specsJson: JSON.stringify([['Колір', 'Графіт'], ['Профіль', '80×80 мм'], ['Навантаж.', 'до 200 кг'], ['Комплект', 'Турнік, бруси, шведська стінка']]),
      price: 21800,
      badgeUk: 'Новинка',
      badgeRu: 'Новинка',
      badgeEn: 'New',
      photo: '',
    },
    {
      category: 'street',
      nameUk: 'Вуличний комплекс «Apex Titan»',
      nameRu: 'Уличный комплекс «Apex Titan»',
      nameEn: 'Street Gym Complex "Apex Titan"',
      specsJson: JSON.stringify([['Колір', 'Коричневий'], ['Профіль', '100×100 мм'], ['Навантаж.', 'до 350 кг'], ['Комплект', 'Повна комплектація']]),
      price: 38400,
      badgeUk: 'Преміум',
      badgeRu: 'Премиум',
      badgeEn: 'Premium',
      photo: '',
    },
    {
      category: 'turnik',
      nameUk: 'Турнік вуличний подвійний «Apex Red»',
      nameRu: 'Турник уличный двойной «Apex Red»',
      nameEn: 'Double Street Pull-up Bar "Apex Red"',
      specsJson: JSON.stringify([['Тип', 'Підлоговий, 2 рівні'], ['Колір', 'Червоний'], ['Профіль', '80×80 мм'], ['Навантаж.', 'до 200 кг']]),
      price: 6900,
      badgeUk: 'Хіт',
      badgeRu: 'Хит',
      badgeEn: 'Best Seller',
      photo: '',
    },
    {
      category: 'turnik',
      nameUk: 'Турнік вуличний з грушею «Apex Brown»',
      nameRu: 'Турник уличный с грушей «Apex Brown»',
      nameEn: 'Street Pull-up Bar with Punching Bag "Apex Brown"',
      specsJson: JSON.stringify([['Тип', 'Підлоговий'], ['Колір', 'Коричневий'], ['Профіль', '80×80 мм'], ['Комплект', 'Кронштейн під грушу']]),
      price: 7800,
      badgeUk: 'Новинка',
      badgeRu: 'Новинка',
      badgeEn: 'New',
      photo: '',
    },
    {
      category: 'turnik',
      nameUk: 'Турнік вуличний подвійний «Apex Green»',
      nameRu: 'Турник уличный двойной «Apex Green»',
      nameEn: 'Double Street Pull-up Bar "Apex Green"',
      specsJson: JSON.stringify([['Тип', 'Підлоговий, 2 рівні'], ['Колір', 'Графіт / зелений'], ['Профіль', '80×80 мм'], ['Навантаж.', 'до 200 кг']]),
      price: 6900,
      badgeUk: null,
      badgeRu: null,
      badgeEn: null,
      photo: '',
    },
    {
      category: 'ruckhod',
      nameUk: 'Рукохід вуличний хвилястий «Apex Red»',
      nameRu: 'Рукоход уличный волнистый «Apex Red»',
      nameEn: 'Curved Monkey Bars "Apex Red"',
      specsJson: JSON.stringify([['Тип', 'Хвилястий'], ['Колір', 'Червоний'], ['Профіль', '80×80 мм'], ['Довжина', '2.5 м']]),
      price: 8400,
      badgeUk: 'Хіт',
      badgeRu: 'Хит',
      badgeEn: 'Best Seller',
      photo: '',
    },
    {
      category: 'ruckhod',
      nameUk: 'Рукохід-комплекс «Apex» з кільцями',
      nameRu: 'Рукоход-комплекс «Apex» с кольцами',
      nameEn: 'Gymnastic Monkey Bars "Apex" with Rings',
      specsJson: JSON.stringify([['Тип', 'Комплекс'], ['Колір', 'Графіт'], ['Комплект', 'Кільця, канат, сітка'], ['Навантаж.', 'до 200 кг']]),
      price: 15900,
      badgeUk: 'Новинка',
      badgeRu: 'Новинка',
      badgeEn: 'New',
      photo: '',
    },
    {
      category: 'ruckhod',
      nameUk: 'Рукохід вуличний прямий «Apex Black»',
      nameRu: 'Рукоход уличный прямой «Apex Black»',
      nameEn: 'Straight Monkey Bars "Apex Black"',
      specsJson: JSON.stringify([['Тип', 'Прямий'], ['Колір', 'Чорний'], ['Профіль', '80×80 мм'], ['Довжина', '3 м']]),
      price: 9700,
      badgeUk: null,
      badgeRu: null,
      badgeEn: null,
      photo: '',
    },
    {
      category: 'swedish',
      nameUk: 'Шведська стінка вулична «Apex Blue» Pro',
      nameRu: 'Шведская стенка уличная «Apex Blue» Pro',
      nameEn: 'Street Swedish Wall "Apex Blue" Pro',
      specsJson: JSON.stringify([['Тип', 'Комплекс'], ['Колір', 'Синій'], ['Комплект', 'Турнік, бруси, прес-упор'], ['Навантаж.', 'до 200 кг']]),
      price: 11900,
      badgeUk: 'Новинка',
      badgeRu: 'Новинка',
      badgeEn: 'New',
      photo: '',
    },
    {
      category: 'workout',
      nameUk: 'Воркаут-майданчик «Apex» Brown',
      nameRu: 'Воркаут-площадка «Apex» Brown',
      nameEn: 'Workout Playground Station "Apex" Brown',
      specsJson: JSON.stringify([['Тип', 'Комплекс'], ['Колір', 'Коричневий'], ['Комплект', 'Турнік, рукохід, шв. стінка, бруси'], ['Навантаж.', 'до 250 кг']]),
      price: 24900,
      badgeUk: 'Топ',
      badgeRu: 'Топ',
      badgeEn: 'Top Choice',
      photo: '',
    },
    {
      category: 'workout',
      nameUk: 'Воркаут-комплекс «Apex» Red рукохід',
      nameRu: 'Воркаут-комплекс «Apex» Red рукоход',
      nameEn: 'Workout Station "Apex" Red with Monkey Bars',
      specsJson: JSON.stringify([['Тип', 'Комплекс'], ['Колір', 'Червоний'], ['Комплект', 'Рукохід, турнік, шв. стінка'], ['Профіль', '80×80 мм']]),
      price: 19500,
      badgeUk: null,
      badgeRu: null,
      badgeEn: null,
      photo: '',
    },
    {
      category: 'workout',
      nameUk: 'Воркаут-комплекс «Apex» Blue Pro',
      nameRu: 'Воркаут-комплекс «Apex» Blue Pro',
      nameEn: 'Workout Station "Apex" Blue Pro',
      specsJson: JSON.stringify([['Тип', 'Комплекс'], ['Колір', 'Синій'], ['Комплект', 'Рукохід, бруси, турніки, шв. стінка'], ['Навантаж.', 'до 250 кг']]),
      price: 26800,
      badgeUk: 'Хіт',
      badgeRu: 'Хит',
      badgeEn: 'Best Seller',
      photo: '',
    },
    {
      category: 'workout',
      nameUk: 'Воркаут-станція «Apex» Black 3в1',
      nameRu: 'Воркаут-станция «Apex» Black 3в1',
      nameEn: 'Workout Station "Apex" Black 3-in-1',
      specsJson: JSON.stringify([['Тип', 'Підлоговий'], ['Колір', 'Чорний'], ['Комплект', '2 турніки + прес-упор'], ['Профіль', '80×80 мм']]),
      price: 8900,
      badgeUk: null,
      badgeRu: null,
      badgeEn: null,
      photo: '',
    },
    {
      category: 'workout',
      nameUk: 'Воркаут-станція «Apex» Red 3в1',
      nameRu: 'Воркаут-станция «Apex» Red 3в1',
      nameEn: 'Workout Station "Apex" Red 3-in-1',
      specsJson: JSON.stringify([['Тип', 'Підлоговий'], ['Колір', 'Червоний'], ['Комплект', 'Турнік + прес-упор'], ['Профіль', '80×80 мм']]),
      price: 9200,
      badgeUk: 'Новинка',
      badgeRu: 'Новинка',
      badgeEn: 'New',
      photo: '',
    },
  ];

  for (const prod of productsData) {
    await prisma.product.create({ data: prod });
  }
  console.log('Products seeded.');

  // 6. Seed UI Static Translations
  const translations = [
    // Header
    { key: 'nav_catalog', uk: 'Каталог', ru: 'Каталог', en: 'Catalog' },
    { key: 'nav_constructor', uk: 'Конструктор', ru: 'Конструктор', en: 'Configurator' },
    { key: 'nav_works', uk: 'Роботи', ru: 'Работы', en: 'Our Works' },
    { key: 'nav_reviews', uk: 'Відгуки', ru: 'Отзывы', en: 'Reviews' },
    { key: 'nav_contact', uk: 'Контакт', ru: 'Контакты', en: 'Contacts' },
    { key: 'nav_cta', uk: 'Замовити', ru: 'Заказать', en: 'Get in Touch' },

    // Hero
    { key: 'hero_eyebrow', uk: 'Total Fitness Solutions — Комплексні рішення', ru: 'Total Fitness Solutions — Комплексные решения', en: 'Total Fitness Solutions — Complex Projects' },
    { key: 'hero_title', uk: 'APEX FORCE — ВЕРШИНА СИЛИ', ru: 'APEX FORCE — ВЕРШИНА СИЛЫ', en: 'APEX FORCE — PEAK OF STRENGTH' },
    { key: 'hero_desc', uk: 'Турніки, рукоходи, бруси, шведські стінки — металеве спортивне обладнання для вулиці та залів. Міцно. Надійно. Назавжди.', ru: 'Турники, рукоходы, брусья, шведские стенки — металлическое спортивное оборудование для улицы и залов. Прочно. Надежно. Навсегда.', en: 'Pull-up bars, monkey bars, parallel bars, Swedish walls — steel sports equipment for outdoor and gym. Strong. Reliable. Forever.' },
    { key: 'hero_btn_catalog', uk: 'Переглянути каталог', ru: 'Посмотреть каталог', en: 'View Catalog' },
    { key: 'hero_btn_builder', uk: 'Зібрати своє ▶', ru: 'Собрать свое ▶', en: 'Configurator ▶' },

    // Catalog Section
    { key: 'catalog_label', uk: 'Продукція', ru: 'Продукция', en: 'Products' },
    { key: 'catalog_title', uk: 'Каталог обладнання', ru: 'Каталог оборудования', en: 'Equipment Catalog' },
    { key: 'catalog_desc', uk: 'Тестова добірка моделей з орієнтовними цінами. Точні характеристики та фото дозаповнимо вашими даними.', ru: 'Тестовая подборка моделей с ориентировочными ценами. Точные характеристики и фото можно изменить в админке.', en: 'Standard list of equipment models with prices. Full specs and photos can be edited via the CMS admin panel.' },
    { key: 'catalog_search', uk: 'Пошук товарів за назвою...', ru: 'Поиск товаров по названию...', en: 'Search products by name...' },
    { key: 'catalog_tab_all', uk: 'Всі', ru: 'Все', en: 'All' },
    { key: 'catalog_tab_street', uk: 'Вуличні комплекси', ru: 'Уличные комплексы', en: 'Outdoor Complexes' },
    { key: 'catalog_tab_turnik', uk: 'Турніки', ru: 'Турники', en: 'Pull-up Bars' },
    { key: 'catalog_tab_ruckhod', uk: 'Рукоходи', ru: 'Рукоходы', en: 'Monkey Bars' },
    { key: 'catalog_tab_workout', uk: 'Воркаут', ru: 'Воркаут', en: 'Workout' },
    { key: 'catalog_tab_swedish', uk: 'Шведські стінки', ru: 'Шведские стенки', en: 'Swedish Walls' },
    { key: 'product_buy', uk: 'Купити', ru: 'Купить', en: 'Buy' },
    { key: 'product_in_cart', uk: 'В кошику', ru: 'В корзине', en: 'In Cart' },
    { key: 'product_badge_new', uk: 'Новинка', ru: 'Новинка', en: 'New' },
    { key: 'product_currency', uk: '₴', ru: '₴', en: '₴' },

    // Constructor Section
    { key: 'constructor_label', uk: 'Конструктор', ru: 'Конструктор', en: 'Customizer' },
    { key: 'constructor_title', uk: 'Зберіть своє', ru: 'Соберите свое', en: 'Build Your Own' },
    { key: 'constructor_desc', uk: 'Виберіть елементи та колір — одразу побачите вартість. Відправте заявку, ми зв\'яжемось для уточнення деталей.', ru: 'Выберите элементы и цвет — сразу увидите стоимость. Отправьте заявку, мы свяжемся для уточнения деталей.', en: 'Choose elements and color — see the price update in real-time. Submit a lead and we will contact you.' },
    { key: 'constructor_step_elements', uk: 'Оберіть елементи', ru: 'Выберите элементы', en: 'Select elements' },
    { key: 'constructor_step_color', uk: 'Колір покриття', ru: 'Цвет покрытия', en: 'Coating Color' },
    { key: 'constructor_summary_title', uk: 'Ваша конфігурація', ru: 'Ваша конфигурация', en: 'Your Configuration' },
    { key: 'constructor_summary_empty', uk: 'Нічого не вибрано', ru: 'Ничего не выбрано', en: 'Nothing selected yet' },
    { key: 'constructor_summary_total', uk: 'Загальна вартість', ru: 'Общая стоимость', en: 'Total Price' },
    { key: 'constructor_form_name', uk: 'Ваше ім\'я', ru: 'Ваше имя', en: 'Your name' },
    { key: 'constructor_form_phone', uk: 'Номер телефону', ru: 'Номер телефона', en: 'Phone number' },
    { key: 'constructor_form_submit', uk: 'Надіслати заявку →', ru: 'Отправить заявку →', en: 'Submit request →' },
    { key: 'constructor_form_hint', uk: 'Менеджер зв\'яжеться з вами протягом 30 хвилин', ru: 'Менеджер свяжется с вами в течение 30 минут', en: 'A manager will contact you within 30 minutes' },

    // Portfolio Section
    { key: 'works_label', uk: 'Наші роботи', ru: 'Наши работы', en: 'Our Portfolio' },
    { key: 'works_title', uk: 'Готові об\'єкти', ru: 'Готовые объекты', en: 'Completed Installations' },
    { key: 'works_desc', uk: 'Фотографії реальних проектів, встановлених нашою командою. Незабаром тут будуть фото з виробництва та встановлення.', ru: 'Фотографии реальных проектов, установленных нашей командой. Скоро здесь будут новые фото.', en: 'Photos of real projects installed by our team. Production and on-site photos will be updated soon.' },
    { key: 'works_soon', uk: 'Фото незабаром', ru: 'Фото скоро', en: 'Photo coming soon' },

    // Reviews Section
    { key: 'reviews_label', uk: 'Відгуки', ru: 'Отзывы', en: 'Reviews' },
    { key: 'reviews_title', uk: 'Що кажуть клієнти', ru: 'Что говорят клиенты', en: 'Client Testimonials' },
    { key: 'reviews_desc', uk: 'Реальні відгуки від людей, які вже отримали своє обладнання Apex Force.', ru: 'Реальные отзывы людей, которые уже купили спортивный инвентарь Apex Force.', en: 'Genuine testimonials from customers who purchased Apex Force equipment.' },

    // Contact Section
    { key: 'contact_label', uk: 'Зв\'язатись', ru: 'Связаться', en: 'Contact Us' },
    { key: 'contact_title', uk: 'Залишились питання?', ru: 'Остались вопросы?', en: 'Have any questions?' },
    { key: 'contact_desc', uk: 'Зателефонуйте, напишіть або залиште заявку — менеджер відповість якомога швидше і допоможе підібрати потрібне обладнання.', ru: 'Позвоните, напишите или оставьте заявку — менеджер ответит как можно скорее и поможет подобрать нужное оборудование.', en: 'Call us, message us, or fill out the form — our manager will respond quickly to help configure your order.' },
    { key: 'contact_form_title', uk: 'Замовити консультацію', ru: 'Заказать консультацию', en: 'Request Consultation' },
    { key: 'contact_form_name', uk: 'Ваше ім\'я', ru: 'Ваше имя', en: 'Your Name' },
    { key: 'contact_form_phone', uk: 'Телефон', ru: 'Телефон', en: 'Phone' },
    { key: 'contact_form_interest', uk: '— Що вас цікавить? —', ru: '— Что вас интересует? —', en: '— What are you interested in? —' },
    { key: 'contact_form_how', uk: '— Як зв\'язатись? —', ru: '— Как связаться? —', en: '— Preferred contact method? —' },
    { key: 'contact_form_comment', uk: 'Коментар або побажання (необов\'язково)', ru: 'Комментарий или пожелания (необязательно)', en: 'Comment or details (optional)' },
    { key: 'contact_form_submit', uk: 'Надіслати заявку →', ru: 'Отправить заявку →', en: 'Send Request →' },

    // Cart Drawer
    { key: 'cart_title', uk: 'Кошик', ru: 'Корзина', en: 'Your Cart' },
    { key: 'cart_empty', uk: 'Кошик порожній', ru: 'Корзина пуста', en: 'Your cart is empty' },
    { key: 'cart_total', uk: 'Разом:', ru: 'Итого:', en: 'Total:' },
    { key: 'cart_checkout', uk: 'Оформити замовлення →', ru: 'Оформить заказ →', en: 'Checkout Order →' },
    { key: 'cart_clear', uk: 'Очистити кошик', ru: 'Очистить корзину', en: 'Clear Cart' },

    // Language Selector Overlay
    { key: 'lang_title', uk: 'Оберіть мову', ru: 'Выберите язык', en: 'Choose your language' },
    { key: 'lang_desc', uk: 'Будь ласка, оберіть зручну мову для роботи з сайтом Apex Force.', ru: 'Пожалуйста, выберите язык для работы с сайтом Apex Force.', en: 'Please select a language for the Apex Force website.' },
    { key: 'lang_btn', uk: 'Підтвердити', ru: 'Подтвердить', en: 'Confirm' },
  ];

  for (const translation of translations) {
    await prisma.contentText.create({ data: translation });
  }
  console.log('UI Static translations seeded.');

  // 7. Seed SEO Metadata
  const seoData = [
    {
      route: '/',
      titleUk: 'Apex Force — Виробництво та продаж спортивного інвентаря',
      titleRu: 'Apex Force — Производство и продажа спортивного инвентаря',
      titleEn: 'Apex Force — Professional Gym & Outdoor Equipment',
      descUk: 'Турніки, рукоходи, шведські стінки від виробника Apex Force. Комплексні фітнес рішення, якість та надійність.',
      descRu: 'Турники, рукоходы, шведские стенки от производителя Apex Force. Комплексные фитнес-решения, качество и надежность.',
      descEn: 'Steel pull-up bars, monkey bars, parallel bars, and custom outdoor gym solutions by Apex Force. High-quality and durable.',
    },
    {
      route: '/catalog',
      titleUk: 'Каталог обладнання Apex Force — Турніки, бруси, комплекси',
      titleRu: 'Каталог оборудования Apex Force — Турники, брусья, комплексы',
      titleEn: 'Apex Force Equipment Catalog — Pull-up Bars, Racks, Complexes',
      descUk: 'Широкий асортимент спортивного інвентаря для вулиці та залів. Купити обладнання Apex Force з гарантією.',
      descRu: 'Широкий ассортимент спортивного инвентаря для улицы и залов. Купить оборудование Apex Force с гарантией.',
      descEn: 'Explore our catalog of professional sports equipment. Workout stations, pull-up systems, and custom racks.',
    },
    {
      route: '/build',
      titleUk: 'Конструктор спортивних комплексів «Собери сам» — Apex Force',
      titleRu: 'Конструктор спортивных комплексов «Собери сам» — Apex Force',
      titleEn: 'Custom Gym Configuration Configurator — Apex Force',
      descUk: 'Створіть свій власний спортивний комплекс онлайн, оберіть елементи, колір та дізнайтесь вартість.',
      descRu: 'Создайте свой собственный спортивный комплекс онлайн, выберите элементы, цвет и узнайте стоимость.',
      descEn: 'Build and customize your own fitness complex online, select key parts, colors and estimate the project budget.',
    },
  ];

  for (const s of seoData) {
    await prisma.seoMetadata.create({ data: s });
  }
  console.log('SEO metadata seeded.');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
