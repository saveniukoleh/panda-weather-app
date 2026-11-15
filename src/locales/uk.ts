import en from './en';

type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };

const uk = {
  app: {
    title: 'Погода Panda',
  },
  nav: {
    label: 'Розділи застосунку',
    weather: 'Погода',
    favorites: 'Обране',
  },
  language: {
    label: 'Мова',
    en: 'EN',
    uk: 'UK',
  },
  dashboard: {
    label: 'Панель погоди',
    title: 'Погода',
    addWidget: 'Додати віджет',
    widgetLimit: 'Максимум 5 віджетів.',
    remove: 'Видалити',
    removeTitle: 'Видалити віджет',
    removeMessage: 'Видалити цей віджет погоди?',
    removeConfirm: 'Видалити',
    cancel: 'Скасувати',
  },
  weather: {
    label: 'Погода',
    loading: 'Завантаження погоди',
    retry: 'Повторити',
    favorite: 'Обране',
    favorited: 'В обраному',
    addFavorite: 'Додати до обраного',
    removeFavorite: 'Видалити з обраного',
    range: 'Період прогнозу',
    day: 'День',
    fiveDays: '5 днів',
    limitTitle: 'Ліміт обраного',
    limitMessage: 'Можна зберегти до 5 міст. Видаліть одне з обраних, перш ніж додати інше.',
    ok: 'Гаразд',
    close: 'Закрити',
  },
  search: {
    city: 'Місто',
    searching: 'Пошук',
    suggestions: 'Пропозиції міст',
  },
  card: {
    feelsLike: 'Відчувається як',
    humidity: 'Вологість',
    wind: 'Вітер',
    pressure: 'Тиск',
  },
  chart: {
    empty: 'Немає даних про температуру',
    label: 'Температура',
  },
  favorites: {
    label: 'Обране',
    title: 'Обране',
    emptyTitle: 'Немає обраних міст',
    emptyDescription: 'Збережіть місто на панелі погоди, щоб побачити його тут.',
  },
  loading: {
    default: 'Завантаження',
  },
  dialog: {
    confirm: 'Підтвердити',
    cancel: 'Скасувати',
  },
  errors: {
    network: 'Не вдалося з’єднатися зі службою погоди.',
    unauthorized: 'Служба погоди відхилила запит.',
    not_found: 'Запитані дані не знайдено.',
    rate_limit: 'Службу погоди обмежено за частотою запитів. Спробуйте пізніше.',
    invalid_request: 'Запит не дозволено.',
    invalid_response: 'Служба погоди повернула неочікувану відповідь.',
    unknown: 'Служба погоди недоступна.',
  },
} satisfies Widen<typeof en>;

export default uk;
