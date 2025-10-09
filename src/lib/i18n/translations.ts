// Russian translations for the nutrition tracker app

export const translations = {
  // Common
  common: {
    loading: 'Загрузка...',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    view: 'Просмотр',
    back: 'Назад',
    next: 'Далее',
    submit: 'Отправить',
    upload: 'Загрузить',
    email: 'Email',
    password: 'Пароль',
    name: 'Имя',
    file: 'Файл',
    optional: 'Необязательно',
    required: 'Обязательно'
  },

  // Navigation
  nav: {
    dashboard: 'Панель управления',
    profile: 'Профиль',
    upload: 'Загрузить файлы',
    admin: 'Администрирование',
    logout: 'Выход'
  },

  // Authentication
  auth: {
    login: {
      title: 'Вход - Центр питания Виктория Фалей',
      heading: 'Вход',
      signIn: 'Войти',
      signingIn: 'Вход...',
      noAccount: 'Нет аккаунта?',
      signUpHere: 'Зарегистрируйтесь здесь',
      invalidCredentials: 'Неверный email или пароль',
      loginFailed: 'Ошибка входа'
    },
    signup: {
      title: 'Регистрация - Центр питания Виктория Фалей',
      heading: 'Создать аккаунт',
      fullName: 'Полное имя',
      confirmPassword: 'Подтвердите пароль',
      createAccount: 'Создать аккаунт',
      creatingAccount: 'Создание аккаунта...',
      haveAccount: 'Уже есть аккаунт?',
      signInHere: 'Войдите здесь',
      passwordsNotMatch: 'Пароли не совпадают',
      passwordTooShort: 'Пароль должен содержать минимум 6 символов',
      allFieldsRequired: 'Все поля обязательны',
      registrationFailed: 'Ошибка регистрации'
    }
  },

  // Profile
  profile: {
    title: 'Профиль - Центр питания Виктория Фалей',
    heading: 'Мой профиль',
    setup: {
      title: 'Настройка профиля - Центр питания Виктория Фалей',
      heading: 'Завершите настройку профиля',
      description: 'Добавьте фото профиля для персонализации аккаунта.',
      choosePicture: 'Выбрать фото профиля',
      fileFormat: 'JPEG, PNG, GIF или WebP (макс. 5МБ)',
      completeSetup: 'Завершить настройку',
      settingUp: 'Настройка...',
      skipForNow: 'Пропустить',
      setupFailed: 'Ошибка настройки профиля'
    },
    changePicture: 'Изменить фото профиля',
    emailCannotChange: 'Email нельзя изменить',
    updating: 'Обновление...',
    updateProfile: 'Обновить профиль',
    profileUpdated: 'Профиль успешно обновлен!',
    profileUpdateFailed: 'Ошибка обновления профиля',
    invalidFileType: 'Недопустимый тип файла. Используйте JPEG, PNG, GIF или WebP.',
    fileTooLarge: 'Файл слишком большой. Максимальный размер 5МБ.'
  },

  // Dashboard
  dashboard: {
    title: 'Панель управления - Центр питания Виктория Фалей',
    welcome: 'Добро пожаловать',
    subtitle: 'Отслеживайте свои данные о питании и здоровье',
    stats: {
      totalFiles: 'Всего файлов',
      processed: 'Обработано',
      reviews: 'Отзывы'
    },
    files: {
      yourFiles: 'Ваши файлы',
      noFiles: 'Файлы еще не загружены',
      uploaded: 'Загружено',
      processed: 'Обработано',
      processing: 'Обработка...',
      analysisResults: 'Результаты анализа',
      testType: 'Тип анализа',
      summary: 'Резюме',
      keyResults: 'Основные результаты',
      moreResults: 'еще результатов',
      professionalReviews: 'Профессиональные отзывы',
      viewDetails: 'Подробности',
      viewImage: 'Просмотр изображения'
    },
    empty: {
      noFiles: 'Файлов пока нет',
      description: 'Загрузите ваши медицинские анализы и фото еды, чтобы начать!',
      uploadFirst: 'Загрузить первый файл'
    }
  },

  // Upload
  upload: {
    title: 'Загрузка файлов - Центр питания Виктория Фалей',
    heading: 'Загрузить файлы',
    description: 'Загрузите ваши медицинские анализы в PDF или фото еды для анализа.',
    dropZone: {
      dropHere: 'Перетащите файлы сюда',
      orClick: 'или нажмите для выбора',
      fileTypes: 'PDF файлы и изображения (JPEG, PNG, GIF, WebP) до 10МБ каждый',
      browseFiles: 'Выбрать файлы'
    },
    selectedFiles: 'Выбранные файлы',
    uploading: 'Загрузка...',
    uploadFiles: 'Загрузить файлы',
    uploadSuccess: 'Файлы успешно загружены!',
    uploadFailed: 'Ошибка загрузки',
    backToDashboard: '← Назад к панели управления',
    errors: {
      noFiles: 'Выберите хотя бы один файл',
      invalidFileType: 'Разрешены только PDF файлы и изображения (JPEG, PNG, GIF, WebP)',
      fileTooLarge: 'слишком большой. Максимальный размер 10МБ'
    }
  },

  // Admin
  admin: {
    title: 'Админ-отзывы - Центр питания Виктория Фалей',
    heading: 'Панель администратора',
    description: 'Просмотр и предоставление обратной связи по загруженным файлам',
    stats: {
      files: 'Файлов',
      reviewed: 'Просмотрено',
      pending: 'В ожидании'
    },
    files: {
      details: 'Подробности',
      extractedData: 'Извлеченные данные',
      pdfProcessing: '⏳ Обработка PDF в процессе...',
      imageFile: '📷 Файл изображения - автоматическая обработка не требуется',
      previousReviews: 'Предыдущие отзывы',
      addReview: 'Добавить отзыв',
      addFollowUp: 'Добавить дополнительный отзыв',
      reviewerName: 'Имя рецензента',
      reviewText: 'Отзыв и рекомендации',
      reviewPlaceholder: 'Предоставьте ваш профессиональный анализ и рекомендации...',
      submitting: 'Отправка...',
      submitReview: 'Отправить отзыв',
      viewImage: 'Просмотр изображения'
    },
    empty: {
      noFiles: 'Нет файлов для просмотра',
      description: 'Когда пользователи загрузят файлы, они появятся здесь для просмотра.'
    }
  },

  // File status
  status: {
    normal: 'норма',
    high: 'высокий',
    low: 'низкий',
    critical: 'критический'
  },

  // Errors
  errors: {
    sessionExpired: 'Сессия истекла',
    unauthorized: 'Неавторизованный доступ',
    serverError: 'Ошибка сервера',
    networkError: 'Ошибка сети',
    fileNotFound: 'Файл не найден',
    processingError: 'Ошибка обработки - требуется ручная проверка'
  }
};