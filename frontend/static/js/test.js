const pathParts = window.location.pathname.split("/");
const subjectId = pathParts[2];
const testTypeId = pathParts[3];

let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let questionStates = {}; // 'unanswered', 'correct', 'incorrect'

// Захардкоженные математические вопросы с объяснениями
const mathQuestions = [
  {
    id: 1,
    subject_id: 1,
    text: "300 ÷ 10 = ?",
    explanation:
      "Чтобы разделить число на 10, нужно убрать один ноль справа. 300 ÷ 10 = 30",
    answers: [
      { id: 1, question_id: 1, text: "30", is_correct: true },
      { id: 2, question_id: 1, text: "3", is_correct: false },
      { id: 3, question_id: 1, text: "300", is_correct: false },
      { id: 4, question_id: 1, text: "3000", is_correct: false },
    ],
  },
  {
    id: 2,
    subject_id: 1,
    text: "25 × 4 = ?",
    explanation:
      "25 × 4 — это то же самое, что 25 × 2 × 2 = 50 × 2 = 100. Запомни: 25 × 4 всегда равно 100.",
    answers: [
      { id: 5, question_id: 2, text: "100", is_correct: true },
      { id: 6, question_id: 2, text: "90", is_correct: false },
      { id: 7, question_id: 2, text: "125", is_correct: false },
      { id: 8, question_id: 2, text: "80", is_correct: false },
    ],
  },
  {
    id: 3,
    subject_id: 1,
    text: "144 ÷ 12 = ?",
    explanation: "144 — это 12 × 12 (12 в квадрате). Поэтому 144 ÷ 12 = 12.",
    answers: [
      { id: 9, question_id: 3, text: "12", is_correct: true },
      { id: 10, question_id: 3, text: "14", is_correct: false },
      { id: 11, question_id: 3, text: "11", is_correct: false },
      { id: 12, question_id: 3, text: "13", is_correct: false },
    ],
  },
  {
    id: 4,
    subject_id: 1,
    text: "15 + 27 = ?",
    explanation:
      "15 + 27: Сначала единицы: 5 + 7 = 12 (записываем 2, переносим 1). Потом десятки: 1 + 2 + 1 = 4. Ответ: 42.",
    answers: [
      { id: 13, question_id: 4, text: "42", is_correct: true },
      { id: 14, question_id: 4, text: "32", is_correct: false },
      { id: 15, question_id: 4, text: "52", is_correct: false },
      { id: 16, question_id: 4, text: "41", is_correct: false },
    ],
  },
  {
    id: 5,
    subject_id: 1,
    text: "81 ÷ 9 = ?",
    explanation: "81 — это 9 × 9 (9 в квадрате). Поэтому 81 ÷ 9 = 9.",
    answers: [
      { id: 17, question_id: 5, text: "9", is_correct: true },
      { id: 18, question_id: 5, text: "8", is_correct: false },
      { id: 19, question_id: 5, text: "7", is_correct: false },
      { id: 20, question_id: 5, text: "10", is_correct: false },
    ],
  },
  {
    id: 6,
    subject_id: 1,
    text: "50 - 18 = ?",
    explanation:
      "50 - 18: сначала вычитаем 20 (получаем 30), потом прибавляем 2. Ответ: 32.",
    answers: [
      { id: 21, question_id: 6, text: "32", is_correct: true },
      { id: 22, question_id: 6, text: "42", is_correct: false },
      { id: 23, question_id: 6, text: "28", is_correct: false },
      { id: 24, question_id: 6, text: "38", is_correct: false },
    ],
  },
  {
    id: 7,
    subject_id: 1,
    text: "7 × 8 = ?",
    explanation: "7 × 8 = 56. Полезно запомнить: 5, 6, 7, 8 → 56 = 7 × 8.",
    answers: [
      { id: 25, question_id: 7, text: "56", is_correct: true },
      { id: 26, question_id: 7, text: "54", is_correct: false },
      { id: 27, question_id: 7, text: "63", is_correct: false },
      { id: 28, question_id: 7, text: "48", is_correct: false },
    ],
  },
  {
    id: 8,
    subject_id: 1,
    text: "1000 - 347 = ?",
    explanation:
      "От 1000 отнимаем 347: 1000 - 347 = 653. Проще: 999 - 347 = 652, потом +1 = 653.",
    answers: [
      { id: 29, question_id: 8, text: "653", is_correct: true },
      { id: 30, question_id: 8, text: "753", is_correct: false },
      { id: 31, question_id: 8, text: "553", is_correct: false },
      { id: 32, question_id: 8, text: "663", is_correct: false },
    ],
  },
  {
    id: 9,
    subject_id: 1,
    text: "36 ÷ 4 = ?",
    explanation:
      "36 ÷ 4: сколько раз 4 помещается в 36? 4 × 9 = 36, значит ответ 9.",
    answers: [
      { id: 33, question_id: 9, text: "9", is_correct: true },
      { id: 34, question_id: 9, text: "8", is_correct: false },
      { id: 35, question_id: 9, text: "6", is_correct: false },
      { id: 36, question_id: 9, text: "12", is_correct: false },
    ],
  },
  {
    id: 10,
    subject_id: 1,
    text: "125 × 8 = ?",
    explanation: "125 × 8 = 1000. Это полезно запомнить: 125 — это 1000 ÷ 8.",
    answers: [
      { id: 37, question_id: 10, text: "1000", is_correct: true },
      { id: 38, question_id: 10, text: "800", is_correct: false },
      { id: 39, question_id: 10, text: "900", is_correct: false },
      { id: 40, question_id: 10, text: "1125", is_correct: false },
    ],
  },
  {
    id: 11,
    subject_id: 1,
    text: "64 ÷ 8 = ?",
    explanation: "64 — это 8 × 8 (8 в квадрате). Поэтому 64 ÷ 8 = 8.",
    answers: [
      { id: 41, question_id: 11, text: "8", is_correct: true },
      { id: 42, question_id: 11, text: "6", is_correct: false },
      { id: 43, question_id: 11, text: "7", is_correct: false },
      { id: 44, question_id: 11, text: "9", is_correct: false },
    ],
  },
  {
    id: 12,
    subject_id: 1,
    text: "45 + 38 = ?",
    explanation:
      "45 + 38: единицы 5 + 8 = 13 (пишем 3, переносим 1). Десятки: 4 + 3 + 1 = 8. Ответ: 83.",
    answers: [
      { id: 45, question_id: 12, text: "83", is_correct: true },
      { id: 46, question_id: 12, text: "73", is_correct: false },
      { id: 47, question_id: 12, text: "93", is_correct: false },
      { id: 48, question_id: 12, text: "82", is_correct: false },
    ],
  },
  {
    id: 13,
    subject_id: 1,
    text: "9 × 9 = ?",
    explanation: "9 × 9 = 81. Девять девяток — это 81.",
    answers: [
      { id: 49, question_id: 13, text: "81", is_correct: true },
      { id: 50, question_id: 13, text: "72", is_correct: false },
      { id: 51, question_id: 13, text: "90", is_correct: false },
      { id: 52, question_id: 13, text: "89", is_correct: false },
    ],
  },
  {
    id: 14,
    subject_id: 1,
    text: "200 - 75 = ?",
    explanation: "200 - 75: проще сначала 200 - 80 = 120, потом +5 = 125.",
    answers: [
      { id: 53, question_id: 14, text: "125", is_correct: true },
      { id: 54, question_id: 14, text: "115", is_correct: false },
      { id: 55, question_id: 14, text: "135", is_correct: false },
      { id: 56, question_id: 14, text: "175", is_correct: false },
    ],
  },
  {
    id: 15,
    subject_id: 1,
    text: "12 × 12 = ?",
    explanation:
      "12 × 12 = 144. Это полезно запомнить: 12 в квадрате равно 144.",
    answers: [
      { id: 57, question_id: 15, text: "144", is_correct: true },
      { id: 58, question_id: 15, text: "124", is_correct: false },
      { id: 59, question_id: 15, text: "132", is_correct: false },
      { id: 60, question_id: 15, text: "156", is_correct: false },
    ],
  },
  {
    id: 16,
    subject_id: 1,
    text: "72 ÷ 8 = ?",
    explanation: "72 ÷ 8 = 9. Потому что 8 × 9 = 72.",
    answers: [
      { id: 61, question_id: 16, text: "9", is_correct: true },
      { id: 62, question_id: 16, text: "8", is_correct: false },
      { id: 63, question_id: 16, text: "7", is_correct: false },
      { id: 64, question_id: 16, text: "10", is_correct: false },
    ],
  },
  {
    id: 17,
    subject_id: 1,
    text: "33 + 49 = ?",
    explanation:
      "33 + 49: единицы 3 + 9 = 12. Десятки: 3 + 4 + 1 = 8. Ответ: 82.",
    answers: [
      { id: 65, question_id: 17, text: "82", is_correct: true },
      { id: 66, question_id: 17, text: "72", is_correct: false },
      { id: 67, question_id: 17, text: "92", is_correct: false },
      { id: 68, question_id: 17, text: "81", is_correct: false },
    ],
  },
  {
    id: 18,
    subject_id: 1,
    text: "6 × 7 = ?",
    explanation: "6 × 7 = 42. Шесть семёрок — сорок два.",
    answers: [
      { id: 69, question_id: 18, text: "42", is_correct: true },
      { id: 70, question_id: 18, text: "48", is_correct: false },
      { id: 71, question_id: 18, text: "36", is_correct: false },
      { id: 72, question_id: 18, text: "49", is_correct: false },
    ],
  },
  {
    id: 19,
    subject_id: 1,
    text: "100 - 37 = ?",
    explanation: "100 - 37 = 63. Проще: 100 - 40 = 60, потом +3 = 63.",
    answers: [
      { id: 73, question_id: 19, text: "63", is_correct: true },
      { id: 74, question_id: 19, text: "73", is_correct: false },
      { id: 75, question_id: 19, text: "53", is_correct: false },
      { id: 76, question_id: 19, text: "67", is_correct: false },
    ],
  },
  {
    id: 20,
    subject_id: 1,
    text: "11 × 11 = ?",
    explanation: "11 × 11 = 121. Одиннадцать в квадрате — сто двадцать один.",
    answers: [
      { id: 77, question_id: 20, text: "121", is_correct: true },
      { id: 78, question_id: 20, text: "111", is_correct: false },
      { id: 79, question_id: 20, text: "122", is_correct: false },
      { id: 80, question_id: 20, text: "131", is_correct: false },
    ],
  },
  {
    id: 21,
    subject_id: 1,
    text: "56 ÷ 7 = ?",
    explanation: "56 ÷ 7 = 8. Потому что 7 × 8 = 56.",
    answers: [
      { id: 81, question_id: 21, text: "8", is_correct: true },
      { id: 82, question_id: 21, text: "7", is_correct: false },
      { id: 83, question_id: 21, text: "9", is_correct: false },
      { id: 84, question_id: 21, text: "6", is_correct: false },
    ],
  },
  {
    id: 22,
    subject_id: 1,
    text: "17 + 28 = ?",
    explanation:
      "17 + 28: единицы 7 + 8 = 15. Десятки: 1 + 2 + 1 = 4. Ответ: 45.",
    answers: [
      { id: 85, question_id: 22, text: "45", is_correct: true },
      { id: 86, question_id: 22, text: "35", is_correct: false },
      { id: 87, question_id: 22, text: "55", is_correct: false },
      { id: 88, question_id: 22, text: "44", is_correct: false },
    ],
  },
  {
    id: 23,
    subject_id: 1,
    text: "8 × 9 = ?",
    explanation: "8 × 9 = 72. Восемь девяток — семьдесят два.",
    answers: [
      { id: 89, question_id: 23, text: "72", is_correct: true },
      { id: 90, question_id: 23, text: "81", is_correct: false },
      { id: 91, question_id: 23, text: "63", is_correct: false },
      { id: 92, question_id: 23, text: "64", is_correct: false },
    ],
  },
  {
    id: 24,
    subject_id: 1,
    text: "90 ÷ 9 = ?",
    explanation: "90 ÷ 9 = 10. Потому что 9 × 10 = 90.",
    answers: [
      { id: 93, question_id: 24, text: "10", is_correct: true },
      { id: 94, question_id: 24, text: "9", is_correct: false },
      { id: 95, question_id: 24, text: "11", is_correct: false },
      { id: 96, question_id: 24, text: "8", is_correct: false },
    ],
  },
  {
    id: 25,
    subject_id: 1,
    text: "150 + 75 = ?",
    explanation: "150 + 75 = 225. Можно: 150 + 50 = 200, потом + 25 = 225.",
    answers: [
      { id: 97, question_id: 25, text: "225", is_correct: true },
      { id: 98, question_id: 25, text: "215", is_correct: false },
      { id: 99, question_id: 25, text: "235", is_correct: false },
      { id: 100, question_id: 25, text: "175", is_correct: false },
    ],
  },
];

// Вопросы по Физике (subject_id: 2)
const physicsQuestions = [
  {
    id: 101,
    subject_id: 2,
    text: "Чему равно ускорение свободного падения на Земле?",
    explanation:
      "Ускорение свободного падения g ≈ 9.8 м/с². Это константа для поверхности Земли.",
    answers: [
      { id: 201, question_id: 101, text: "9.8 м/с²", is_correct: true },
      { id: 202, question_id: 101, text: "10.8 м/с²", is_correct: false },
      { id: 203, question_id: 101, text: "8.8 м/с²", is_correct: false },
      { id: 204, question_id: 101, text: "6.8 м/с²", is_correct: false },
    ],
  },
  {
    id: 102,
    subject_id: 2,
    text: "Как называется единица измерения силы?",
    explanation: "Сила измеряется в Ньютонах (Н). 1 Н = 1 кг × м/с².",
    answers: [
      { id: 205, question_id: 102, text: "Ньютон", is_correct: true },
      { id: 206, question_id: 102, text: "Джоуль", is_correct: false },
      { id: 207, question_id: 102, text: "Ватт", is_correct: false },
      { id: 208, question_id: 102, text: "Паскаль", is_correct: false },
    ],
  },
  {
    id: 103,
    subject_id: 2,
    text: "Формула скорости при равномерном движении?",
    explanation: "v = S/t — скорость равна расстоянию делённому на время.",
    answers: [
      { id: 209, question_id: 103, text: "v = S/t", is_correct: true },
      { id: 210, question_id: 103, text: "v = S×t", is_correct: false },
      { id: 211, question_id: 103, text: "v = t/S", is_correct: false },
      { id: 212, question_id: 103, text: "v = S+t", is_correct: false },
    ],
  },
  {
    id: 104,
    subject_id: 2,
    text: "Что такое масса?",
    explanation:
      "Масса — мера инертности тела. Показывает, как сильно тело сопротивляется изменению скорости.",
    answers: [
      {
        id: 213,
        question_id: 104,
        text: "Мера инертности тела",
        is_correct: true,
      },
      { id: 214, question_id: 104, text: "Сила притяжения", is_correct: false },
      { id: 215, question_id: 104, text: "Скорость тела", is_correct: false },
      { id: 216, question_id: 104, text: "Энергия тела", is_correct: false },
    ],
  },
  {
    id: 105,
    subject_id: 2,
    text: "Второй закон Ньютона: F = ?",
    explanation: "F = ma — сила равна произведению массы на ускорение.",
    answers: [
      { id: 217, question_id: 105, text: "ma", is_correct: true },
      { id: 218, question_id: 105, text: "mv", is_correct: false },
      { id: 219, question_id: 105, text: "m/a", is_correct: false },
      { id: 220, question_id: 105, text: "a/m", is_correct: false },
    ],
  },
  {
    id: 106,
    subject_id: 2,
    text: "Единица измерения давления?",
    explanation: "Давление измеряется в Паскалях (Па). 1 Па = 1 Н/м².",
    answers: [
      { id: 221, question_id: 106, text: "Паскаль", is_correct: true },
      { id: 222, question_id: 106, text: "Бар", is_correct: false },
      { id: 223, question_id: 106, text: "Атмосфера", is_correct: false },
      { id: 224, question_id: 106, text: "Торр", is_correct: false },
    ],
  },
  {
    id: 107,
    subject_id: 2,
    text: "В чем измеряется работа?",
    explanation: "Работа и энергия измеряются в Джоулях (Дж). 1 Дж = 1 Н × м.",
    answers: [
      { id: 225, question_id: 107, text: "Джоуль", is_correct: true },
      { id: 226, question_id: 107, text: "Ватт", is_correct: false },
      { id: 227, question_id: 107, text: "Кал", is_correct: false },
      { id: 228, question_id: 107, text: "Эрг", is_correct: false },
    ],
  },
  {
    id: 108,
    subject_id: 2,
    text: "Единица измерения мощности?",
    explanation: "Мощность измеряется в Ваттах (Вт). 1 Вт = 1 Дж/с.",
    answers: [
      { id: 229, question_id: 108, text: "Ватт", is_correct: true },
      { id: 230, question_id: 108, text: "Киловатт", is_correct: false },
      { id: 231, question_id: 108, text: "Лошадиная сила", is_correct: false },
      { id: 232, question_id: 108, text: "Вольт", is_correct: false },
    ],
  },
  {
    id: 109,
    subject_id: 2,
    text: "Закон Ома для участка цепи?",
    explanation:
      "I = U/R — сила тока прямо пропорциональна напряжению и обратно пропорциональна сопротивлению.",
    answers: [
      { id: 233, question_id: 109, text: "I = U/R", is_correct: true },
      { id: 234, question_id: 109, text: "U = I/R", is_correct: false },
      { id: 235, question_id: 109, text: "R = I/U", is_correct: false },
      { id: 236, question_id: 109, text: "I = U*R", is_correct: false },
    ],
  },
  {
    id: 110,
    subject_id: 2,
    text: "Скорость света в вакууме?",
    explanation: "Скорость света c ≈ 300 000 км/с или 3*10^8 м/с.",
    answers: [
      { id: 237, question_id: 110, text: "300 000 км/с", is_correct: true },
      { id: 238, question_id: 110, text: "150 000 км/с", is_correct: false },
      { id: 239, question_id: 110, text: "400 000 км/с", is_correct: false },
      { id: 240, question_id: 110, text: "200 000 км/с", is_correct: false },
    ],
  },
  {
    id: 111,
    subject_id: 2,
    text: "Что такое дифракция?",
    explanation:
      "Дифракция — огибание волнами препятствий. Характерна для всех типов волн.",
    answers: [
      {
        id: 241,
        question_id: 111,
        text: "Огибание волнами препятствий",
        is_correct: true,
      },
      {
        id: 242,
        question_id: 111,
        text: "Отражение от зеркала",
        is_correct: false,
      },
      {
        id: 243,
        question_id: 111,
        text: "Преломление в линзе",
        is_correct: false,
      },
      {
        id: 244,
        question_id: 111,
        text: "Поглощение света",
        is_correct: false,
      },
    ],
  },
  {
    id: 112,
    subject_id: 2,
    text: "Формула кинетической энергии?",
    explanation: "Ek = (mv^2)/2. Зависит от массы и квадрата скорости.",
    answers: [
      { id: 245, question_id: 112, text: "(mv^2)/2", is_correct: true },
      { id: 246, question_id: 112, text: "mgh", is_correct: false },
      { id: 247, question_id: 112, text: "mv", is_correct: false },
      { id: 248, question_id: 112, text: "ma", is_correct: false },
    ],
  },
  {
    id: 113,
    subject_id: 2,
    text: "Формула потенциальной энергии в поле тяготения?",
    explanation: "Ep = mgh. Зависит от массы, высоты и g.",
    answers: [
      { id: 249, question_id: 113, text: "mgh", is_correct: true },
      { id: 250, question_id: 113, text: "(mv^2)/2", is_correct: false },
      { id: 251, question_id: 113, text: "P/V", is_correct: false },
      { id: 252, question_id: 113, text: "F*S", is_correct: false },
    ],
  },
  {
    id: 114,
    subject_id: 2,
    text: "Что такое резонанс?",
    explanation:
      "Резонанс — резкое возрастание амплитуды колебаний при совпадении внешней частоты с собственной.",
    answers: [
      {
        id: 253,
        question_id: 114,
        text: "Резкое возрастание амплитуды",
        is_correct: true,
      },
      {
        id: 254,
        question_id: 114,
        text: "Затухание колебаний",
        is_correct: false,
      },
      {
        id: 255,
        question_id: 114,
        text: "Изменение частоты",
        is_correct: false,
      },
      { id: 256, question_id: 114, text: "Отражение звука", is_correct: false },
    ],
  },
  {
    id: 115,
    subject_id: 2,
    text: "Чем определяется высота звука?",
    explanation:
      "Высота звука определяется частотой колебаний. Чем выше частота, тем выше звук.",
    answers: [
      { id: 257, question_id: 115, text: "Частотой", is_correct: true },
      { id: 258, question_id: 115, text: "Амплитудой", is_correct: false },
      { id: 259, question_id: 115, text: "Тембром", is_correct: false },
      { id: 260, question_id: 115, text: "Фазой", is_correct: false },
    ],
  },
  {
    id: 116,
    subject_id: 2,
    text: "Что такое фотон?",
    explanation:
      "Фотон — квант (элементарная частица) электромагнитного излучения (света).",
    answers: [
      { id: 261, question_id: 116, text: "Квант света", is_correct: true },
      {
        id: 262,
        question_id: 116,
        text: "Отрицательный ион",
        is_correct: false,
      },
      {
        id: 263,
        question_id: 116,
        text: "Положительный ион",
        is_correct: false,
      },
      { id: 264, question_id: 116, text: "Атом водорода", is_correct: false },
    ],
  },
  {
    id: 117,
    subject_id: 2,
    text: "Температура кипения воды при нормальном давлении?",
    explanation:
      "При 1 атм (760 мм рт. ст.) вода кипит при 100 градусах Цельсия.",
    answers: [
      { id: 265, question_id: 117, text: "100°C", is_correct: true },
      { id: 266, question_id: 117, text: "0°C", is_correct: false },
      { id: 267, question_id: 117, text: "273°C", is_correct: false },
      { id: 268, question_id: 117, text: "50°C", is_correct: false },
    ],
  },
  {
    id: 118,
    subject_id: 2,
    text: "Что такое конвекция?",
    explanation:
      "Конвекция — вид теплопередачи, при котором энергия переносится струями жидкости или газа.",
    answers: [
      {
        id: 269,
        question_id: 118,
        text: "Перенос тепла струями газа/жидкости",
        is_correct: true,
      },
      {
        id: 270,
        question_id: 118,
        text: "Теплопроводность металлов",
        is_correct: false,
      },
      {
        id: 271,
        question_id: 118,
        text: "Излучение Солнца",
        is_correct: false,
      },
      { id: 272, question_id: 118, text: "Сжатие газа", is_correct: false },
    ],
  },
  {
    id: 119,
    subject_id: 2,
    text: "Что измеряет амперметр?",
    explanation: "Амперметр измеряет силу электрического тока в амперах (А).",
    answers: [
      { id: 273, question_id: 119, text: "Силу тока", is_correct: true },
      { id: 274, question_id: 119, text: "Напряжение", is_correct: false },
      { id: 275, question_id: 119, text: "Сопротивление", is_correct: false },
      { id: 276, question_id: 119, text: "Мощность", is_correct: false },
    ],
  },
  {
    id: 120,
    subject_id: 2,
    text: "Что измеряет вольтметр?",
    explanation: "Вольтметр измеряет электрическое напряжение в вольтах (В).",
    answers: [
      { id: 277, question_id: 120, text: "Напряжение", is_correct: true },
      { id: 278, question_id: 120, text: "Силу тока", is_correct: false },
      { id: 279, question_id: 120, text: "Заряд", is_correct: false },
      { id: 280, question_id: 120, text: "Емкость", is_correct: false },
    ],
  },
  {
    id: 121,
    subject_id: 2,
    text: "Как направлена сила тяжести?",
    explanation:
      "Сила тяжести всегда направлена вертикально вниз, к центру Земли.",
    answers: [
      { id: 281, question_id: 121, text: "Вертикально вниз", is_correct: true },
      { id: 282, question_id: 121, text: "Вдоль движения", is_correct: false },
      {
        id: 283,
        question_id: 121,
        text: "Вертикально вверх",
        is_correct: false,
      },
      { id: 284, question_id: 121, text: "Горизонтально", is_correct: false },
    ],
  },
  {
    id: 122,
    subject_id: 2,
    text: "Что такое период колебаний?",
    explanation:
      "Период (T) — это время, за которое совершается одно полное колебание.",
    answers: [
      {
        id: 285,
        question_id: 122,
        text: "Время одного колебания",
        is_correct: true,
      },
      {
        id: 286,
        question_id: 122,
        text: "Число колебаний в секунду",
        is_correct: false,
      },
      { id: 287, question_id: 122, text: "Амплитуда", is_correct: false },
      { id: 288, question_id: 122, text: "Длина волны", is_correct: false },
    ],
  },
  {
    id: 123,
    subject_id: 2,
    text: "Что такое частота колебаний?",
    explanation:
      "Частота (v) — это число колебаний в единицу времени. Измеряется в Герцах (Гц).",
    answers: [
      {
        id: 289,
        question_id: 123,
        text: "Число колебаний в секунду",
        is_correct: true,
      },
      {
        id: 290,
        question_id: 123,
        text: "Время одного колебания",
        is_correct: false,
      },
      { id: 291, question_id: 123, text: "Скорость волны", is_correct: false },
      { id: 292, question_id: 123, text: "Энергия волны", is_correct: false },
    ],
  },
  {
    id: 124,
    subject_id: 2,
    text: "В чем измеряется электрический заряд?",
    explanation: "Электрический заряд измеряется в Кулонах (Кл).",
    answers: [
      { id: 293, question_id: 124, text: "Кулон", is_correct: true },
      { id: 294, question_id: 124, text: "Фарада", is_correct: false },
      { id: 295, question_id: 124, text: "Ом", is_correct: false },
      { id: 296, question_id: 124, text: "Генри", is_correct: false },
    ],
  },
  {
    id: 125,
    subject_id: 2,
    text: "Что такое инерция?",
    explanation:
      "Инерция — явление сохранения скорости тела при отсутствии внешних воздействий.",
    answers: [
      {
        id: 297,
        question_id: 125,
        text: "Сохранение скорости",
        is_correct: true,
      },
      { id: 298, question_id: 125, text: "Ускорение", is_correct: false },
      { id: 299, question_id: 125, text: "Трение", is_correct: false },
      { id: 300, question_id: 125, text: "Сила", is_correct: false },
    ],
  },
];

const osQuestions = [
  {
    id: 301,
    subject_id: 3,
    text: "Что такое ядро операционной системы?",
    explanation:
      "Ядро — центральная часть ОС, обеспечивающая управление ресурсами и взаимодействие с оборудованием.",
    answers: [
      {
        id: 30101,
        question_id: 301,
        text: "Центральная часть ОС",
        is_correct: true,
      },
      {
        id: 30102,
        question_id: 301,
        text: "Пользовательский интерфейс",
        is_correct: false,
      },
      {
        id: 30103,
        question_id: 301,
        text: "Файловый менеджер",
        is_correct: false,
      },
      { id: 30104, question_id: 301, text: "Браузер", is_correct: false },
    ],
  },
  {
    id: 302,
    subject_id: 3,
    text: "Какая функция ОС отвечает за распределение памяти?",
    explanation:
      "Менеджер памяти (Memory Management) отвечает за выделение и освобождение памяти для процессов.",
    answers: [
      {
        id: 30201,
        question_id: 302,
        text: "Управление памятью",
        is_correct: true,
      },
      {
        id: 30202,
        question_id: 302,
        text: "Управление вводом-выводом",
        is_correct: false,
      },
      {
        id: 30203,
        question_id: 302,
        text: "Планировщик задач",
        is_correct: false,
      },
      { id: 30204, question_id: 302, text: "Драйвер диска", is_correct: false },
    ],
  },
  {
    id: 303,
    subject_id: 3,
    text: "Что такое процесс в ОС?",
    explanation:
      "Процесс — это выполняющаяся программа, включая текущие значения регистров и переменных.",
    answers: [
      {
        id: 30301,
        question_id: 303,
        text: "Выполняющаяся программа",
        is_correct: true,
      },
      { id: 30302, question_id: 303, text: "Файл на диске", is_correct: false },
      {
        id: 30303,
        question_id: 303,
        text: "Текстовый редактор",
        is_correct: false,
      },
      {
        id: 30304,
        question_id: 303,
        text: "Команда в терминале",
        is_correct: false,
      },
    ],
  },
  {
    id: 304,
    subject_id: 3,
    text: "Что такое виртуальная память?",
    explanation:
      "Виртуальная память позволяет процессу использовать адресное пространство, превышающее физическую память RAM.",
    answers: [
      {
        id: 30401,
        question_id: 304,
        text: "Использование диска как расширение RAM",
        is_correct: true,
      },
      {
        id: 30402,
        question_id: 304,
        text: "Облачное хранилище",
        is_correct: false,
      },
      {
        id: 30403,
        question_id: 304,
        text: "Кэш процессора",
        is_correct: false,
      },
      { id: 30404, question_id: 304, text: "Сетевая папка", is_correct: false },
    ],
  },
  {
    id: 305,
    subject_id: 3,
    text: "Что делает планировщик задач?",
    explanation:
      "Планировщик решает, какой процесс будет использовать процессор в данный момент времени.",
    answers: [
      {
        id: 30501,
        question_id: 305,
        text: "Распределяет процессорное время",
        is_correct: true,
      },
      {
        id: 30502,
        question_id: 305,
        text: "Проверяет диски на ошибки",
        is_correct: false,
      },
      {
        id: 30503,
        question_id: 305,
        text: "Устанавливает обновления",
        is_correct: false,
      },
      {
        id: 30504,
        question_id: 305,
        text: "Блокирует вирусы",
        is_correct: false,
      },
    ],
  },
  {
    id: 306,
    subject_id: 3,
    text: "Что такое многозадачность?",
    explanation:
      "Многозадачность — способность ОС выполнять несколько задач одновременно (или имитировать это).",
    answers: [
      {
        id: 30601,
        question_id: 306,
        text: "Одновременное выполнение задач",
        is_correct: true,
      },
      {
        id: 30602,
        question_id: 306,
        text: "Наличие нескольких дисков",
        is_correct: false,
      },
      {
        id: 30603,
        question_id: 306,
        text: "Большой объем памяти",
        is_correct: false,
      },
      {
        id: 30604,
        question_id: 306,
        text: "Подключение нескольких мониторов",
        is_correct: false,
      },
    ],
  },
  {
    id: 307,
    subject_id: 3,
    text: "Что такое драйвер устройства?",
    explanation:
      "Драйвер — ПО, позволяющее ОС и программам взаимодействовать с аппаратным обеспечением.",
    answers: [
      {
        id: 30701,
        question_id: 307,
        text: "ПО для работы с оборудованием",
        is_correct: true,
      },
      {
        id: 30702,
        question_id: 307,
        text: "Программа для печати текста",
        is_correct: false,
      },
      {
        id: 30703,
        question_id: 307,
        text: "Антивирусная база",
        is_correct: false,
      },
      {
        id: 30704,
        question_id: 307,
        text: "Сетевое устройство",
        is_correct: false,
      },
    ],
  },
  {
    id: 308,
    subject_id: 3,
    text: "Что такое файловая система?",
    explanation:
      "Файловая система определяет способ организации, хранения и именования данных на носителях.",
    answers: [
      {
        id: 30801,
        question_id: 308,
        text: "Способ организации данных на диске",
        is_correct: true,
      },
      {
        id: 30802,
        question_id: 308,
        text: "Архиватор файлов",
        is_correct: false,
      },
      {
        id: 30803,
        question_id: 308,
        text: "Программа для удаления файлов",
        is_correct: false,
      },
      { id: 30804, question_id: 308, text: "Жесткий диск", is_correct: false },
    ],
  },
  {
    id: 309,
    subject_id: 3,
    text: "Что такое прерывание (interrupt)?",
    explanation:
      "Прерывание — сигнал процессору о событии, требующем немедленного внимания со стороны ПО.",
    answers: [
      {
        id: 30901,
        question_id: 309,
        text: "Сигнал для привлечения внимания CPU",
        is_correct: true,
      },
      {
        id: 30902,
        question_id: 309,
        text: "Выключение компьютера",
        is_correct: false,
      },
      {
        id: 30903,
        question_id: 309,
        text: "Ошибка в коде программы",
        is_correct: false,
      },
      {
        id: 30904,
        question_id: 309,
        text: "Пауза в воспроизведении музыки",
        is_correct: false,
      },
    ],
  },
  {
    id: 310,
    subject_id: 3,
    text: "Что такое взаимная блокировка (deadlock)?",
    explanation:
      "Deadlock — ситуация, когда процессы заблокированы в ожидании ресурсов, занятых друг другом.",
    answers: [
      {
        id: 31001,
        question_id: 310,
        text: "Взаимное ожидание ресурсов",
        is_correct: true,
      },
      {
        id: 31002,
        question_id: 310,
        text: "Пароль на вход в систему",
        is_correct: false,
      },
      {
        id: 31003,
        question_id: 310,
        text: "Защита от записи на флешку",
        is_correct: false,
      },
      {
        id: 31004,
        question_id: 310,
        text: "Обрыв интернет-соединения",
        is_correct: false,
      },
    ],
  },
  {
    id: 311,
    subject_id: 3,
    text: "Что такое свопинг (swapping)?",
    explanation:
      "Свопинг — выгрузка неиспользуемых фрагментов памяти из ОЗУ на диск и обратно.",
    answers: [
      {
        id: 31101,
        question_id: 311,
        text: "Выгрузка данных из RAM на диск",
        is_correct: true,
      },
      {
        id: 31102,
        question_id: 311,
        text: "Замена процессора на новый",
        is_correct: false,
      },
      {
        id: 31103,
        question_id: 311,
        text: "Переключение между окнами",
        is_correct: false,
      },
      {
        id: 31104,
        question_id: 311,
        text: "Обмен файлами по сети",
        is_correct: false,
      },
    ],
  },
  {
    id: 312,
    subject_id: 3,
    text: "Что такое оболочка (shell)?",
    explanation:
      "Шелл — интерфейс взаимодействия пользователя с функциями ядра ОС (командная строка или графическая).",
    answers: [
      {
        id: 31201,
        question_id: 312,
        text: "Интерфейс для команд пользователя",
        is_correct: true,
      },
      {
        id: 31202,
        question_id: 312,
        text: "Защитный кожух ПК",
        is_correct: false,
      },
      {
        id: 31203,
        question_id: 312,
        text: "Протокол передачи данных",
        is_correct: false,
      },
      {
        id: 31204,
        question_id: 312,
        text: "Тип жесткого диска",
        is_correct: false,
      },
    ],
  },
  {
    id: 313,
    subject_id: 3,
    text: "В чем разница между процессом и потоком?",
    explanation:
      "Поток — это легковесный процесс внутри родительского процесса, они делят общую память.",
    answers: [
      {
        id: 31301,
        question_id: 313,
        text: "Потоки делят общую память процесса",
        is_correct: true,
      },
      {
        id: 31302,
        question_id: 313,
        text: "Процессы работают быстрее потоков",
        is_correct: false,
      },
      {
        id: 31303,
        question_id: 313,
        text: "Потоки — это внешние программы",
        is_correct: false,
      },
      { id: 31304, question_id: 313, text: "Разницы нет", is_correct: false },
    ],
  },
  {
    id: 314,
    subject_id: 3,
    text: "Что такое системный вызов (syscall)?",
    explanation:
      "Интерфейс между приложением и ядром, позволяющий запрашивать услуги ОС (чтение файлов и т.д.).",
    answers: [
      {
        id: 31401,
        question_id: 314,
        text: "Запрос программы к ядру ОС",
        is_correct: true,
      },
      {
        id: 31402,
        question_id: 314,
        text: "Звонок другу через Skype",
        is_correct: false,
      },
      {
        id: 31403,
        question_id: 314,
        text: "Ошибка в системе",
        is_correct: false,
      },
      {
        id: 31404,
        question_id: 314,
        text: "Обновление Windows",
        is_correct: false,
      },
    ],
  },
  {
    id: 315,
    subject_id: 3,
    text: "Для чего используется BIOS/UEFI?",
    explanation:
      "Для начальной инициализации аппаратного обеспечения и запуска загрузчика ОС.",
    answers: [
      {
        id: 31501,
        question_id: 315,
        text: "Начальный запуск оборудования",
        is_correct: true,
      },
      {
        id: 31502,
        question_id: 315,
        text: "Редактирование текстов",
        is_correct: false,
      },
      {
        id: 31503,
        question_id: 315,
        text: "Защита от хакеров",
        is_correct: false,
      },
      {
        id: 31504,
        question_id: 315,
        text: "Ускорение работы интернета",
        is_correct: false,
      },
    ],
  },
  {
    id: 316,
    subject_id: 3,
    text: "Что такое сегментация памяти?",
    explanation:
      "Метод управления памятью, при котором адресное пространство делится на логические фрагменты (сегменты).",
    answers: [
      {
        id: 31601,
        question_id: 316,
        text: "Разбиение памяти на логические части",
        is_correct: true,
      },
      { id: 31602, question_id: 316, text: "Очистка диска", is_correct: false },
      {
        id: 31603,
        question_id: 316,
        text: "Удаление старых программ",
        is_correct: false,
      },
      { id: 31604, question_id: 316, text: "Загрузка ОС", is_correct: false },
    ],
  },
  {
    id: 317,
    subject_id: 3,
    text: "Что такое RAID-массив?",
    explanation:
      "Объединение нескольких физических дисков в одну логическую систему для повышения скорости или надежности.",
    answers: [
      {
        id: 31701,
        question_id: 317,
        text: "Объединение нескольких дисков",
        is_correct: true,
      },
      {
        id: 31702,
        question_id: 317,
        text: "Тип видеокарты",
        is_correct: false,
      },
      {
        id: 31703,
        question_id: 317,
        text: "Оперативная память",
        is_correct: false,
      },
      {
        id: 31704,
        question_id: 317,
        text: "Файл конфигурации системы",
        is_correct: false,
      },
    ],
  },
  {
    id: 318,
    subject_id: 3,
    text: "Что такое режим суперпользователя (root/admin)?",
    explanation:
      "Это режим работы с неограниченным доступом ко всем файлам и командам ОС.",
    answers: [
      {
        id: 31801,
        question_id: 318,
        text: "Режим полного доступа к системе",
        is_correct: true,
      },
      {
        id: 31802,
        question_id: 318,
        text: "Гостевой режим",
        is_correct: false,
      },
      {
        id: 31803,
        question_id: 318,
        text: "Безопасный режим загрузки",
        is_correct: false,
      },
      {
        id: 31804,
        question_id: 318,
        text: "Режим энергосбережения",
        is_correct: false,
      },
    ],
  },
  {
    id: 319,
    subject_id: 3,
    text: "Что делает команда ping?",
    explanation:
      "Проверяет наличие сетевого соединения с удаленным хостом путем отправки ICMP пакетов.",
    answers: [
      {
        id: 31901,
        question_id: 319,
        text: "Проверка сетевого соединения",
        is_correct: true,
      },
      {
        id: 31902,
        question_id: 319,
        text: "Скачивание файла",
        is_correct: false,
      },
      {
        id: 31903,
        question_id: 319,
        text: "Удаление папки",
        is_correct: false,
      },
      {
        id: 31904,
        question_id: 319,
        text: "Выключение системы",
        is_correct: false,
      },
    ],
  },
  {
    id: 320,
    subject_id: 3,
    text: "Что такое IP-адрес?",
    explanation:
      "Уникальный идентификатор устройства в сети, использующей протокол IP.",
    answers: [
      {
        id: 32001,
        question_id: 320,
        text: "Уникальный сетевой номер устройства",
        is_correct: true,
      },
      {
        id: 32002,
        question_id: 320,
        text: "Название компьютера",
        is_correct: false,
      },
      {
        id: 32003,
        question_id: 320,
        text: "Почтовый адрес владельца",
        is_correct: false,
      },
      {
        id: 32004,
        question_id: 320,
        text: "Серийный номер видеокарты",
        is_correct: false,
      },
    ],
  },
  {
    id: 321,
    subject_id: 3,
    text: "Что такое FAT16/FAT32?",
    explanation:
      "Старые типы файловых систем, разработанные для DOS и ранних версий Windows.",
    answers: [
      {
        id: 32101,
        question_id: 321,
        text: "Типы файловых систем",
        is_correct: true,
      },
      {
        id: 32102,
        question_id: 321,
        text: "Виды процессоров",
        is_correct: false,
      },
      {
        id: 32103,
        question_id: 321,
        text: "Форматы изображений",
        is_correct: false,
      },
      {
        id: 32104,
        question_id: 321,
        text: "Протоколы шифрования",
        is_correct: false,
      },
    ],
  },
  {
    id: 322,
    subject_id: 3,
    text: "Что такое открытое ПО (Open Source)?",
    explanation:
      "Программное обеспечение, исходный код которого доступен для просмотра, изменения и распространения.",
    answers: [
      {
        id: 32201,
        question_id: 322,
        text: "ПО с доступным исходным кодом",
        is_correct: true,
      },
      {
        id: 32202,
        question_id: 322,
        text: "ПО, работающее только через интернет",
        is_correct: false,
      },
      {
        id: 32203,
        question_id: 322,
        text: "Платное корпоративное ПО",
        is_correct: false,
      },
      {
        id: 32204,
        question_id: 322,
        text: "ПО без графического интерфейса",
        is_correct: false,
      },
    ],
  },
  {
    id: 323,
    subject_id: 3,
    text: "Что такое демон (daemon) в Linux?",
    explanation:
      "Демон — это фоновый процесс, работающий без прямого взаимодействия с пользователем.",
    answers: [
      {
        id: 32301,
        question_id: 323,
        text: "Фоновый системный процесс",
        is_correct: true,
      },
      {
        id: 32302,
        question_id: 323,
        text: "Компьютерный вирус",
        is_correct: false,
      },
      {
        id: 32303,
        question_id: 323,
        text: "Постоянный пользователь системы",
        is_correct: false,
      },
      { id: 32304, question_id: 323, text: "Имя хакера", is_correct: false },
    ],
  },
  {
    id: 324,
    subject_id: 3,
    text: "Что такое драйвер NTFS?",
    explanation:
      "Драйвер, позволяющий ОС работать с файловой системой NTFS (основной для современных Windows).",
    answers: [
      {
        id: 32401,
        question_id: 324,
        text: "Драйвер для файловой системы",
        is_correct: true,
      },
      { id: 32402, question_id: 324, text: "Видеодрайвер", is_correct: false },
      {
        id: 32403,
        question_id: 324,
        text: "ПО для сетевой карты",
        is_correct: false,
      },
      {
        id: 32404,
        question_id: 324,
        text: "Менеджер паролей",
        is_correct: false,
      },
    ],
  },
  {
    id: 325,
    subject_id: 3,
    text: "Для чего нужен Диспетчер задач?",
    explanation:
      "Позволяет просматривать запущенные процессы, использование CPU, памяти и управлять ими.",
    answers: [
      {
        id: 32501,
        question_id: 325,
        text: "Мониторинг и управление процессами",
        is_correct: true,
      },
      {
        id: 32502,
        question_id: 325,
        text: "Создание документов Word",
        is_correct: false,
      },
      {
        id: 32503,
        question_id: 325,
        text: "Установка новых игр",
        is_correct: false,
      },
      {
        id: 32504,
        question_id: 325,
        text: "Защита системы от хакеров",
        is_correct: false,
      },
    ],
  },
];

// Вопросы по Базам данных (subject_id: 4)
const dbQuestions = [
  {
    id: 401,
    subject_id: 4,
    text: "Что такое SQL?",
    explanation:
      "SQL — Structured Query Language, язык для работы с реляционными базами данных.",
    answers: [
      {
        id: 40101,
        question_id: 401,
        text: "Язык запросов к БД",
        is_correct: true,
      },
      {
        id: 40102,
        question_id: 401,
        text: "Тип базы данных",
        is_correct: false,
      },
      {
        id: 40103,
        question_id: 401,
        text: "Язык программирования",
        is_correct: false,
      },
      {
        id: 40104,
        question_id: 401,
        text: "Операционная система",
        is_correct: false,
      },
    ],
  },
  {
    id: 402,
    subject_id: 4,
    text: "Что такое PRIMARY KEY?",
    explanation:
      "PRIMARY KEY — уникальный идентификатор записи в таблице. Не может быть NULL.",
    answers: [
      {
        id: 40201,
        question_id: 402,
        text: "Уникальный идентификатор записи",
        is_correct: true,
      },
      {
        id: 40202,
        question_id: 402,
        text: "Название таблицы",
        is_correct: false,
      },
      { id: 40203, question_id: 402, text: "Тип данных", is_correct: false },
      {
        id: 40204,
        question_id: 402,
        text: "Индекс для поиска",
        is_correct: false,
      },
    ],
  },
  {
    id: 403,
    subject_id: 4,
    text: "Команда для выборки данных?",
    explanation: "SELECT используется для выборки данных из таблиц.",
    answers: [
      { id: 40301, question_id: 403, text: "SELECT", is_correct: true },
      { id: 40302, question_id: 403, text: "INSERT", is_correct: false },
      { id: 40303, question_id: 403, text: "UPDATE", is_correct: false },
      { id: 40304, question_id: 403, text: "DELETE", is_correct: false },
    ],
  },
  {
    id: 404,
    subject_id: 4,
    text: "Что такое JOIN?",
    explanation:
      "JOIN — операция объединения данных из нескольких таблиц по связующему полю.",
    answers: [
      {
        id: 40401,
        question_id: 404,
        text: "Объединение таблиц",
        is_correct: true,
      },
      {
        id: 40402,
        question_id: 404,
        text: "Создание таблицы",
        is_correct: false,
      },
      {
        id: 40403,
        question_id: 404,
        text: "Удаление данных",
        is_correct: false,
      },
      { id: 40404, question_id: 404, text: "Сортировка", is_correct: false },
    ],
  },
  {
    id: 405,
    subject_id: 4,
    text: "Что означает ACID в БД?",
    explanation:
      "ACID: Atomicity (атомарность), Consistency (согласованность), Isolation (изоляция), Durability (долговечность).",
    answers: [
      {
        id: 40501,
        question_id: 405,
        text: "Свойства транзакций",
        is_correct: true,
      },
      { id: 40502, question_id: 405, text: "Тип индекса", is_correct: false },
      { id: 40503, question_id: 405, text: "Команда SQL", is_correct: false },
      { id: 40504, question_id: 405, text: "Модель данных", is_correct: false },
    ],
  },
  {
    id: 406,
    subject_id: 4,
    text: "Что такое FOREIGN KEY?",
    explanation:
      "Внешний ключ — поле, которое ссылается на PRIMARY KEY в другой таблице.",
    answers: [
      {
        id: 40601,
        question_id: 406,
        text: "Внешний ключ (связь таблиц)",
        is_correct: true,
      },
      {
        id: 40602,
        question_id: 406,
        text: "Первичный ключ",
        is_correct: false,
      },
      {
        id: 40603,
        question_id: 406,
        text: "Индексный ключ",
        is_correct: false,
      },
      {
        id: 40604,
        question_id: 406,
        text: "Секретный ключ",
        is_correct: false,
      },
    ],
  },
  {
    id: 407,
    subject_id: 4,
    text: "Что такое нормализация?",
    explanation:
      "Нормализация — процесс организации данных для уменьшения избыточности и зависимости.",
    answers: [
      {
        id: 40701,
        question_id: 407,
        text: "Устранение дублирования данных",
        is_correct: true,
      },
      {
        id: 40702,
        question_id: 407,
        text: "Увеличение объема БД",
        is_correct: false,
      },
      {
        id: 40703,
        question_id: 407,
        text: "Шифрование данных",
        is_correct: false,
      },
      { id: 40704, question_id: 407, text: "Архивация БД", is_correct: false },
    ],
  },
  {
    id: 408,
    subject_id: 4,
    text: "Команда для добавления данных?",
    explanation: "INSERT INTO используется для вставки новых строк в таблицу.",
    answers: [
      { id: 40801, question_id: 408, text: "INSERT", is_correct: true },
      { id: 40802, question_id: 408, text: "CREATE", is_correct: false },
      { id: 40803, question_id: 408, text: "ADD", is_correct: false },
      { id: 40804, question_id: 408, text: "PUT", is_correct: false },
    ],
  },
  {
    id: 409,
    subject_id: 4,
    text: "Для чего нужен INDEX?",
    explanation:
      "Индексы ускоряют поиск данных в таблице за счет создания специальных структур.",
    answers: [
      {
        id: 40901,
        question_id: 409,
        text: "Ускорение поиска",
        is_correct: true,
      },
      {
        id: 40902,
        question_id: 409,
        text: "Экономия места",
        is_correct: false,
      },
      { id: 40903, question_id: 409, text: "Защита данных", is_correct: false },
      {
        id: 40904,
        question_id: 409,
        text: "Смена кодировки",
        is_correct: false,
      },
    ],
  },
  {
    id: 410,
    subject_id: 4,
    text: "Что такое NoSQL?",
    explanation:
      "NoSQL — широкий спектр СУБД, отличных от традиционных реляционных (ключ-значение, документные и др.).",
    answers: [
      {
        id: 41001,
        question_id: 410,
        text: "Нереляционные СУБД",
        is_correct: true,
      },
      {
        id: 41002,
        question_id: 410,
        text: "БД без SQL-запросов вовсе",
        is_correct: false,
      },
      {
        id: 41003,
        question_id: 410,
        text: "Новая версия SQL",
        is_correct: false,
      },
      { id: 41004, question_id: 410, text: "БД без таблиц", is_correct: false },
    ],
  },
  {
    id: 411,
    subject_id: 4,
    text: "Что делает оператор GROUP BY?",
    explanation:
      "GROUP BY используется для группировки строк с одинаковыми значениями в сводные строки.",
    answers: [
      {
        id: 41101,
        question_id: 411,
        text: "Группировка результатов",
        is_correct: true,
      },
      {
        id: 41102,
        question_id: 411,
        text: "Сортировка результатов",
        is_correct: false,
      },
      {
        id: 41103,
        question_id: 411,
        text: "Удаление дубликатов",
        is_correct: false,
      },
      {
        id: 41104,
        question_id: 411,
        text: "Переименование столбцов",
        is_correct: false,
      },
    ],
  },
  {
    id: 412,
    subject_id: 4,
    text: "Что делает оператор ORDER BY?",
    explanation:
      "ORDER BY используется для сортировки результирующего набора данных.",
    answers: [
      {
        id: 41201,
        question_id: 412,
        text: "Сортировка результатов",
        is_correct: true,
      },
      {
        id: 41202,
        question_id: 412,
        text: "Фильтрация результатов",
        is_correct: false,
      },
      {
        id: 41203,
        question_id: 412,
        text: "Объединение таблиц",
        is_correct: false,
      },
      {
        id: 41204,
        question_id: 412,
        text: "Создание индекса",
        is_correct: false,
      },
    ],
  },
  {
    id: 413,
    subject_id: 4,
    text: "Что такое транзакция?",
    explanation:
      "Транзакция — группа последовательных операций с БД, которая выполняется целиком или не выполняется вовсе.",
    answers: [
      {
        id: 41301,
        question_id: 413,
        text: "Группа операций как единое целое",
        is_correct: true,
      },
      {
        id: 41302,
        question_id: 413,
        text: "Одиночный запрос SELECT",
        is_correct: false,
      },
      {
        id: 41303,
        question_id: 413,
        text: "Создание новой базы",
        is_correct: false,
      },
      {
        id: 41304,
        question_id: 413,
        text: "Передача данных по сети",
        is_correct: false,
      },
    ],
  },
  {
    id: 414,
    subject_id: 4,
    text: "Команда для изменения структуры таблицы?",
    explanation:
      "ALTER TABLE используется для добавления, удаления или изменения столбцов в существующей таблице.",
    answers: [
      { id: 41401, question_id: 414, text: "ALTER TABLE", is_correct: true },
      { id: 41402, question_id: 414, text: "UPDATE TABLE", is_correct: false },
      { id: 41403, question_id: 414, text: "MODIFY TABLE", is_correct: false },
      { id: 41404, question_id: 414, text: "CHANGE TABLE", is_correct: false },
    ],
  },
  {
    id: 415,
    subject_id: 4,
    text: "Что такое VIEW в SQL?",
    explanation:
      "VIEW — виртуальная таблица, содержимое которой определяется SQL-запросом.",
    answers: [
      {
        id: 41501,
        question_id: 415,
        text: "Виртуальная таблица (представление)",
        is_correct: true,
      },
      {
        id: 41502,
        question_id: 415,
        text: "Окно предпросмотра данных",
        is_correct: false,
      },
      {
        id: 41503,
        question_id: 415,
        text: "Графический интерфейс БД",
        is_correct: false,
      },
      {
        id: 41504,
        question_id: 415,
        text: "Скриншот таблицы",
        is_correct: false,
      },
    ],
  },
  {
    id: 416,
    subject_id: 4,
    text: "Что такое триггер?",
    explanation:
      "Триггер — процедура, которая автоматически выполняется при возникновении определенного события (INSERT, UPDATE, DELETE).",
    answers: [
      {
        id: 41601,
        question_id: 416,
        text: "Процедура, вызываемая событием",
        is_correct: true,
      },
      {
        id: 41602,
        question_id: 416,
        text: "Кнопка в интерфейсе",
        is_correct: false,
      },
      {
        id: 41603,
        question_id: 416,
        text: "Тип данных для чисел",
        is_correct: false,
      },
      { id: 41604, question_id: 416, text: "Внешний ключ", is_correct: false },
    ],
  },
  {
    id: 417,
    subject_id: 4,
    text: "Для чего используется оператор HAVING?",
    explanation:
      "HAVING используется для фильтрации сгруппированных данных (после GROUP BY).",
    answers: [
      {
        id: 41701,
        question_id: 417,
        text: "Фильтрация после группировки",
        is_correct: true,
      },
      {
        id: 41702,
        question_id: 417,
        text: "Фильтрация до группировки",
        is_correct: false,
      },
      {
        id: 41703,
        question_id: 417,
        text: "Сортировка данных",
        is_correct: false,
      },
      {
        id: 41704,
        question_id: 417,
        text: "Ограничение количества строк",
        is_correct: false,
      },
    ],
  },
  {
    id: 418,
    subject_id: 4,
    text: "Что такое хранимое процедура (Stored Procedure)?",
    explanation:
      "Это именованный блок SQL-кода, который компилируется и хранится на сервере.",
    answers: [
      {
        id: 41801,
        question_id: 418,
        text: "Именованный блок кода на сервере",
        is_correct: true,
      },
      {
        id: 41802,
        question_id: 418,
        text: "Текстовый файл с SQL-кодом",
        is_correct: false,
      },
      {
        id: 41803,
        question_id: 418,
        text: "История запросов пользователя",
        is_correct: false,
      },
      {
        id: 41804,
        question_id: 418,
        text: "Резервная копия БД",
        is_correct: false,
      },
    ],
  },
  {
    id: 419,
    subject_id: 4,
    text: "Что означает буква C в ACID?",
    explanation: "Consistency — согласованность данных до и после транзакции.",
    answers: [
      {
        id: 41901,
        question_id: 419,
        text: "Consistency (Согласованность)",
        is_correct: true,
      },
      {
        id: 41902,
        question_id: 419,
        text: "Creation (Создание)",
        is_correct: false,
      },
      {
        id: 41903,
        question_id: 419,
        text: "Calculation (Вычисление)",
        is_correct: false,
      },
      {
        id: 41904,
        question_id: 419,
        text: "Clearance (Очистка)",
        is_correct: false,
      },
    ],
  },
  {
    id: 420,
    subject_id: 4,
    text: "Для чего нужен оператор DISTINCT?",
    explanation:
      "DISTINCT используется для возврата только уникальных (различающихся) значений.",
    answers: [
      {
        id: 42001,
        question_id: 420,
        text: "Удаление дубликатов из выборки",
        is_correct: true,
      },
      {
        id: 42002,
        question_id: 420,
        text: "Сортировка по возрастанию",
        is_correct: false,
      },
      {
        id: 42003,
        question_id: 420,
        text: "Объединение строк",
        is_correct: false,
      },
      {
        id: 42004,
        question_id: 420,
        text: "Подсчет суммы значений",
        is_correct: false,
      },
    ],
  },
  {
    id: 421,
    subject_id: 4,
    text: "Что такое реляционная база данных?",
    explanation:
      "БД, в которой информация организована в виде набора таблиц со связями между ними.",
    answers: [
      {
        id: 42101,
        question_id: 421,
        text: "БД на основе таблиц",
        is_correct: true,
      },
      {
        id: 42102,
        question_id: 421,
        text: "БД на основе графов",
        is_correct: false,
      },
      {
        id: 42103,
        question_id: 421,
        text: "БД на основе документов",
        is_correct: false,
      },
      {
        id: 42104,
        question_id: 421,
        text: "Облачное хранилище",
        is_correct: false,
      },
    ],
  },
  {
    id: 422,
    subject_id: 4,
    text: "Команда для удаления всей таблицы?",
    explanation:
      "DROP TABLE удаляет структуру таблицы и все данные в ней полностью.",
    answers: [
      { id: 42201, question_id: 422, text: "DROP TABLE", is_correct: true },
      { id: 42202, question_id: 422, text: "DELETE TABLE", is_correct: false },
      {
        id: 42203,
        question_id: 422,
        text: "TRUNCATE TABLE",
        is_correct: false,
      },
      { id: 42204, question_id: 422, text: "REMOVE TABLE", is_correct: false },
    ],
  },
  {
    id: 423,
    subject_id: 4,
    text: "Что делает команда TRUNCATE?",
    explanation: "Удаляет все данные из таблицы, но сохраняет её структуру.",
    answers: [
      {
        id: 42301,
        question_id: 423,
        text: "Быстрая очистка данных таблицы",
        is_correct: true,
      },
      {
        id: 42302,
        question_id: 423,
        text: "Удаление самой таблицы",
        is_correct: false,
      },
      {
        id: 42303,
        question_id: 423,
        text: "Изменение типа колонки",
        is_correct: false,
      },
      {
        id: 42304,
        question_id: 423,
        text: "Создание копии таблицы",
        is_correct: false,
      },
    ],
  },
  {
    id: 424,
    subject_id: 4,
    text: "Что такое индексация?",
    explanation:
      "Процесс создания индексов для повышения производительности запросов.",
    answers: [
      {
        id: 42401,
        question_id: 424,
        text: "Создание структур для быстрого поиска",
        is_correct: true,
      },
      {
        id: 42402,
        question_id: 424,
        text: "Нумерация страниц в книге",
        is_correct: false,
      },
      {
        id: 42403,
        question_id: 424,
        text: "Сжатие базы данных",
        is_correct: false,
      },
      {
        id: 42404,
        question_id: 424,
        text: "Проверка целостности данных",
        is_correct: false,
      },
    ],
  },
  {
    id: 425,
    subject_id: 4,
    text: "Команда для обновления данных?",
    explanation:
      "UPDATE используется для изменения существующих записей в таблице.",
    answers: [
      { id: 42501, question_id: 425, text: "UPDATE", is_correct: true },
      { id: 42502, question_id: 425, text: "CHANGE", is_correct: false },
      { id: 42503, question_id: 425, text: "MODIFY", is_correct: false },
      { id: 42504, question_id: 425, text: "SET", is_correct: false },
    ],
  },
];

// Вопросы по Машинному обучению (subject_id: 5)
const mlQuestions = [
  {
    id: 501,
    subject_id: 5,
    text: "Что такое нейронная сеть?",
    explanation:
      "Нейронная сеть — математическая модель, имитирующая работу нейронов мозга для решения задач ИИ.",
    answers: [
      {
        id: 50101,
        question_id: 501,
        text: "Математическая модель на основе нейронов мозга",
        is_correct: true,
      },
      {
        id: 50102,
        question_id: 501,
        text: "Компьютерная локальная сеть",
        is_correct: false,
      },
      {
        id: 50103,
        question_id: 501,
        text: "Тип базы данных",
        is_correct: false,
      },
      {
        id: 50104,
        question_id: 501,
        text: "Системная шина данных",
        is_correct: false,
      },
    ],
  },
  {
    id: 502,
    subject_id: 5,
    text: "Что такое обучение с учителем (Supervised Learning)?",
    explanation:
      "Модель обучается на парах 'входные данные - правильный ответ'.",
    answers: [
      {
        id: 50201,
        question_id: 502,
        text: "Обучение на размеченных данных",
        is_correct: true,
      },
      {
        id: 50202,
        question_id: 502,
        text: "Самостоятельный поиск закономерностей",
        is_correct: false,
      },
      {
        id: 50203,
        question_id: 502,
        text: "Чтение учебников нейросетью",
        is_correct: false,
      },
      {
        id: 50204,
        question_id: 502,
        text: "Программирование алгоритмов вручную",
        is_correct: false,
      },
    ],
  },
  {
    id: 503,
    subject_id: 5,
    text: "Что такое переобучение (Overfitting)?",
    explanation:
      "Ситуация, когда модель слишком хорошо 'запомнила' обучающие данные, но плохо работает на новых.",
    answers: [
      {
        id: 50301,
        question_id: 503,
        text: "Высокая точность на трейне, низкая на тесте",
        is_correct: true,
      },
      {
        id: 50302,
        question_id: 503,
        text: "Слишком долгое время обучения",
        is_correct: false,
      },
      {
        id: 50303,
        question_id: 503,
        text: "Недостаток данных для обучения",
        is_correct: false,
      },
      {
        id: 50304,
        question_id: 503,
        text: "Использование устаревших алгоритмов",
        is_correct: false,
      },
    ],
  },
  {
    id: 504,
    subject_id: 5,
    text: "Что делает функция активации?",
    explanation:
      "Вносит нелинейность в работу нейрона, позволяя решать сложные задачи.",
    answers: [
      {
        id: 50401,
        question_id: 504,
        text: "Вносит нелинейность",
        is_correct: true,
      },
      {
        id: 50402,
        question_id: 504,
        text: "Нормализует веса",
        is_correct: false,
      },
      {
        id: 50403,
        question_id: 504,
        text: "Случайным образом меняет веса",
        is_correct: false,
      },
      {
        id: 50404,
        question_id: 504,
        text: "Останавливает обучение",
        is_correct: false,
      },
    ],
  },
  {
    id: 505,
    subject_id: 5,
    text: "Что такое градиентный спуск?",
    explanation:
      "Алгоритм поиска минимума функции потерь для оптимизации весов модели.",
    answers: [
      {
        id: 50501,
        question_id: 505,
        text: "Алгоритм минимизации ошибки",
        is_correct: true,
      },
      {
        id: 50502,
        question_id: 505,
        text: "Способ увеличения точности",
        is_correct: false,
      },
      {
        id: 50503,
        question_id: 505,
        text: "Метод генерации данных",
        is_correct: false,
      },
      {
        id: 50504,
        question_id: 505,
        text: "Вид нейронной сети",
        is_correct: false,
      },
    ],
  },
  {
    id: 506,
    subject_id: 5,
    text: "Что такое Deep Learning?",
    explanation:
      "Подраздел МЛ, использующий нейросети с большим количеством слоев.",
    answers: [
      {
        id: 50601,
        question_id: 506,
        text: "Обучение многослойных нейросетей",
        is_correct: true,
      },
      {
        id: 50602,
        question_id: 506,
        text: "Обучение на больших серверах",
        is_correct: false,
      },
      {
        id: 50603,
        question_id: 506,
        text: "Обучение под водой",
        is_correct: false,
      },
      {
        id: 50604,
        question_id: 506,
        text: "Очень долгое обучение",
        is_correct: false,
      },
    ],
  },
  {
    id: 507,
    subject_id: 5,
    text: "Для чего используется метод К-ближайших соседей (KNN)?",
    explanation:
      "Для классификации объектов на основе сходства с соседями в пространстве признаков.",
    answers: [
      {
        id: 50701,
        question_id: 507,
        text: "Для классификации и регрессии",
        is_correct: true,
      },
      {
        id: 50702,
        question_id: 507,
        text: "Для сжатия изображений",
        is_correct: false,
      },
      {
        id: 50703,
        question_id: 507,
        text: "Для построения маршрутов",
        is_correct: false,
      },
      {
        id: 50704,
        question_id: 507,
        text: "Для шифрования данных",
        is_correct: false,
      },
    ],
  },
  {
    id: 508,
    subject_id: 5,
    text: "Что такое решающее дерево (Decision Tree)?",
    explanation:
      "Модель, представленная в виде иерархической древовидной структуры условий.",
    answers: [
      {
        id: 50801,
        question_id: 508,
        text: "Иерархическая структура из условий",
        is_correct: true,
      },
      {
        id: 50802,
        question_id: 508,
        text: "Схема файловой системы",
        is_correct: false,
      },
      {
        id: 50803,
        question_id: 508,
        text: "База данных связей",
        is_correct: false,
      },
      {
        id: 50804,
        question_id: 508,
        text: "Граф социальной сети",
        is_correct: false,
      },
    ],
  },
  {
    id: 509,
    subject_id: 5,
    text: "Что такое валидационная выборка?",
    explanation:
      "Часть данных, используемая для подбора параметров модели в процессе обучения.",
    answers: [
      {
        id: 50901,
        question_id: 509,
        text: "Данные для настройки параметров",
        is_correct: true,
      },
      {
        id: 50902,
        question_id: 509,
        text: "Данные, которые нельзя смотреть",
        is_correct: false,
      },
      {
        id: 50903,
        question_id: 509,
        text: "Мусорные данные",
        is_correct: false,
      },
      {
        id: 50904,
        question_id: 509,
        text: "Все имеющиеся данные",
        is_correct: false,
      },
    ],
  },
  {
    id: 510,
    subject_id: 5,
    text: "Что делает оператор Softmax?",
    explanation: "Преобразует выходы нейросети в вероятности (сумма равна 1).",
    answers: [
      {
        id: 51001,
        question_id: 510,
        text: "Преобразует числа в вероятности",
        is_correct: true,
      },
      {
        id: 51002,
        question_id: 510,
        text: "Сжимает модель",
        is_correct: false,
      },
      {
        id: 51003,
        question_id: 510,
        text: "Меняет шрифт интерфейса",
        is_correct: false,
      },
      {
        id: 51004,
        question_id: 510,
        text: "Удаляет лишние слои",
        is_correct: false,
      },
    ],
  },
  {
    id: 511,
    subject_id: 5,
    text: "Что такое обучение без учителя (Unsupervised Learning)?",
    explanation:
      "Алгоритм ищет паттерны в неразмеченных данных (напр., кластеризация).",
    answers: [
      {
        id: 51101,
        question_id: 511,
        text: "Поиск скрытых структур в данных",
        is_correct: true,
      },
      {
        id: 51102,
        question_id: 511,
        text: "Обучение без компьютера",
        is_correct: false,
      },
      {
        id: 51103,
        question_id: 511,
        text: "Обучение по готовым ответам",
        is_correct: false,
      },
      {
        id: 51104,
        question_id: 511,
        text: "Написание кода нейросетью",
        is_correct: false,
      },
    ],
  },
  {
    id: 512,
    subject_id: 5,
    text: "Что такое кластеризация?",
    explanation:
      "Объединение похожих объектов в группы (кластеры) без заранее известных меток.",
    answers: [
      {
        id: 51201,
        question_id: 512,
        text: "Группировка объектов по схожести",
        is_correct: true,
      },
      {
        id: 51202,
        question_id: 512,
        text: "Предсказание точной цены",
        is_correct: false,
      },
      {
        id: 51203,
        question_id: 512,
        text: "Удаление дубликатов",
        is_correct: false,
      },
      {
        id: 51204,
        question_id: 512,
        text: "Сортировка по алфавиту",
        is_correct: false,
      },
    ],
  },
  {
    id: 513,
    subject_id: 5,
    text: "Для чего нужен метод главных компонент (PCA)?",
    explanation:
      "Метод PCA используется для снижения размерности данных при сохранении максимума информации.",
    answers: [
      {
        id: 51301,
        question_id: 513,
        text: "Снижение размерности данных",
        is_correct: true,
      },
      {
        id: 51302,
        question_id: 513,
        text: "Увеличение количества фото",
        is_correct: false,
      },
      {
        id: 51303,
        question_id: 513,
        text: "Генерация новых текстов",
        is_correct: false,
      },
      {
        id: 51304,
        question_id: 513,
        text: "Очистка данных от шума",
        is_correct: false,
      },
    ],
  },
  {
    id: 514,
    subject_id: 5,
    text: "Что такое 'Backpropagation'?",
    explanation:
      "Метод обратного распространения ошибки для расчета градиентов и обновления весов нейросети.",
    answers: [
      {
        id: 51401,
        question_id: 514,
        text: "Алгоритм обучения нейросети",
        is_correct: true,
      },
      {
        id: 51402,
        question_id: 514,
        text: "Способ сохранения данных",
        is_correct: false,
      },
      {
        id: 51403,
        question_id: 514,
        text: "Проверка на вирусы",
        is_correct: false,
      },
      {
        id: 51404,
        question_id: 514,
        text: "Метод сжатия весов",
        is_correct: false,
      },
    ],
  },
  {
    id: 515,
    subject_id: 5,
    text: "Что такое веса (weights) в нейросети?",
    explanation:
      "Параметры, которые определяют силу влияния входа на следующий нейрон.",
    answers: [
      {
        id: 51501,
        question_id: 515,
        text: "Умножаемые параметры нейрона",
        is_correct: true,
      },
      {
        id: 51502,
        question_id: 515,
        text: "Размер файла модели",
        is_correct: false,
      },
      {
        id: 51503,
        question_id: 515,
        text: "Важность проекта",
        is_correct: false,
      },
      {
        id: 51504,
        question_id: 515,
        text: "Количество нейронов",
        is_correct: false,
      },
    ],
  },
  {
    id: 516,
    subject_id: 5,
    text: "Что такое Dropout в глубоком обучении?",
    explanation:
      "Техника регуляризации, при которой случайные нейроны выключаются во время обучения.",
    answers: [
      {
        id: 51601,
        question_id: 516,
        text: "Случайное отключение нейронов",
        is_correct: true,
      },
      {
        id: 51602,
        question_id: 516,
        text: "Удаление плохих данных",
        is_correct: false,
      },
      {
        id: 51603,
        question_id: 516,
        text: "Остановка обучения раньше срока",
        is_correct: false,
      },
      {
        id: 51604,
        question_id: 516,
        text: "Выпадение значений из БД",
        is_correct: false,
      },
    ],
  },
  {
    id: 517,
    subject_id: 5,
    text: "Что такое 'Learning Rate'?",
    explanation:
      "Параметр, определяющий величину шага при обновлении весов в градиентном спуске.",
    answers: [
      {
        id: 51701,
        question_id: 517,
        text: "Скорость (шаг) обучения",
        is_correct: true,
      },
      {
        id: 51702,
        question_id: 517,
        text: "Общая длительность обучения",
        is_correct: false,
      },
      {
        id: 51703,
        question_id: 517,
        text: "Процент верных ответов",
        is_correct: false,
      },
      {
        id: 51704,
        question_id: 517,
        text: "Частота процессора",
        is_correct: false,
      },
    ],
  },
  {
    id: 518,
    subject_id: 5,
    text: "Что такое сверточная нейросеть (CNN)?",
    explanation:
      "Тип нейросетей, специально предназначенный для эффективной обработки изображений.",
    answers: [
      {
        id: 51801,
        question_id: 518,
        text: "Сеть для анализа изображений",
        is_correct: true,
      },
      {
        id: 51802,
        question_id: 518,
        text: "Сеть для перевода текстов",
        is_correct: false,
      },
      {
        id: 51803,
        question_id: 518,
        text: "Сеть для хранения паролей",
        is_correct: false,
      },
      {
        id: 51804,
        question_id: 518,
        text: "Сеть для майнинга",
        is_correct: false,
      },
    ],
  },
  {
    id: 519,
    subject_id: 5,
    text: "Что такое рекуррентная нейросеть (RNN)?",
    explanation:
      "Тип нейросетей, подходящий для обработки последовательностей (текст, звук).",
    answers: [
      {
        id: 51901,
        question_id: 519,
        text: "Сеть для последовательностей",
        is_correct: true,
      },
      {
        id: 51902,
        question_id: 519,
        text: "Сеть для быстрой отрисовки",
        is_correct: false,
      },
      {
        id: 51903,
        question_id: 519,
        text: "Сеть для сжатия архивов",
        is_correct: false,
      },
      {
        id: 51904,
        question_id: 519,
        text: "Сеть без циклов",
        is_correct: false,
      },
    ],
  },
  {
    id: 520,
    subject_id: 5,
    text: "Что такое Transfer Learning?",
    explanation:
      "Использование предобученной на одной задаче модели для решения другой похожей задачи.",
    answers: [
      {
        id: 52001,
        question_id: 520,
        text: "Перенос знаний обученной модели",
        is_correct: true,
      },
      {
        id: 52002,
        question_id: 520,
        text: "Копирование кода с GitHub",
        is_correct: false,
      },
      {
        id: 52003,
        question_id: 520,
        text: "Передача данных по USB",
        is_correct: false,
      },
      {
        id: 52004,
        question_id: 520,
        text: "Обучение нейросети учителем",
        is_correct: false,
      },
    ],
  },
  {
    id: 521,
    subject_id: 5,
    text: "Что такое функция потерь (Loss Function)?",
    explanation:
      "Математическая функция, измеряющая разницу между предсказанием и реальностью.",
    answers: [
      {
        id: 52101,
        question_id: 521,
        text: "Мера ошибки предсказания",
        is_correct: true,
      },
      {
        id: 52102,
        question_id: 521,
        text: "Функция удаления файлов",
        is_correct: false,
      },
      {
        id: 52103,
        question_id: 521,
        text: "Функция для работы со звуком",
        is_correct: false,
      },
      {
        id: 52104,
        question_id: 521,
        text: "Штраф за использование API",
        is_correct: false,
      },
    ],
  },
  {
    id: 522,
    subject_id: 5,
    text: "Что такое NLP?",
    explanation:
      "Natural Language Processing — область МЛ, занимающаяся обработкой естественного языка.",
    answers: [
      {
        id: 52201,
        question_id: 522,
        text: "Обработка естественного языка",
        is_correct: true,
      },
      {
        id: 52202,
        question_id: 522,
        text: "Новая линия продуктов",
        is_correct: false,
      },
      {
        id: 52203,
        question_id: 522,
        text: "Низкоуровневое программирование",
        is_correct: false,
      },
      {
        id: 52204,
        question_id: 522,
        text: "Протокол уровня сети",
        is_correct: false,
      },
    ],
  },
  {
    id: 523,
    subject_id: 5,
    text: "Что такое 'Эпоха' (Epoch) в обучении?",
    explanation:
      "Один полный проход всего тренировочного набора данных через нейросеть.",
    answers: [
      {
        id: 52301,
        question_id: 523,
        text: "Один полный проход данных",
        is_correct: true,
      },
      {
        id: 52302,
        question_id: 523,
        text: "Год выхода первой нейросети",
        is_correct: false,
      },
      {
        id: 52303,
        question_id: 523,
        text: "Время жизни модели",
        is_correct: false,
      },
      {
        id: 52304,
        question_id: 523,
        text: "Тип активационной функции",
        is_correct: false,
      },
    ],
  },
  {
    id: 524,
    subject_id: 5,
    text: "Что такое гиперпараметры?",
    explanation:
      "Параметры, которые задает человек перед началом обучения (lr, кол-во слоев и т.д.).",
    answers: [
      {
        id: 52401,
        question_id: 524,
        text: "Параметры, задаваемые человеком",
        is_correct: true,
      },
      {
        id: 52402,
        question_id: 524,
        text: "Самые важные веса модели",
        is_correct: false,
      },
      {
        id: 52403,
        question_id: 524,
        text: "Данные в видеокарте",
        is_correct: false,
      },
      {
        id: 52404,
        question_id: 524,
        text: "Ответы на вопросы теста",
        is_correct: false,
      },
    ],
  },
  {
    id: 525,
    subject_id: 5,
    text: "Что такое батч (Batch)?",
    explanation:
      "Группа примеров, обрабатываемых нейросетью за один шаг градиентного спуска.",
    answers: [
      {
        id: 52501,
        question_id: 525,
        text: "Группа примеров за один шаг",
        is_correct: true,
      },
      {
        id: 52502,
        question_id: 525,
        text: "Ошибка в расчетах",
        is_correct: false,
      },
      {
        id: 52503,
        question_id: 525,
        text: "Метка правильного ответа",
        is_correct: false,
      },
      {
        id: 52504,
        question_id: 525,
        text: "Одна картинка на входе",
        is_correct: false,
      },
    ],
  },
];

// Вопросы по Дипломному проекту (subject_id: 6)
const diplomaQuestions = [
  {
    id: 601,
    subject_id: 6,
    text: "Что должен содержать дипломный проект?",
    explanation:
      "Диплом включает: введение, теорию, практику, результаты, заключение и список литературы.",
    answers: [
      {
        id: 60101,
        question_id: 601,
        text: "Теорию, практику, выводы",
        is_correct: true,
      },
      { id: 60102, question_id: 601, text: "Только код", is_correct: false },
      {
        id: 60103,
        question_id: 601,
        text: "Только презентацию",
        is_correct: false,
      },
      {
        id: 60104,
        question_id: 601,
        text: "Только аннотацию",
        is_correct: false,
      },
    ],
  },
  {
    id: 602,
    subject_id: 6,
    text: "Что такое актуальность темы?",
    explanation:
      "Актуальность — обоснование важности и своевременности темы исследования.",
    answers: [
      {
        id: 60201,
        question_id: 602,
        text: "Важность темы сейчас",
        is_correct: true,
      },
      { id: 60202, question_id: 602, text: "История темы", is_correct: false },
      {
        id: 60203,
        question_id: 602,
        text: "Стоимость проекта",
        is_correct: false,
      },
      {
        id: 60204,
        question_id: 602,
        text: "Оценка за проект",
        is_correct: false,
      },
    ],
  },
  {
    id: 603,
    subject_id: 6,
    text: "Что такое цель исследования?",
    explanation:
      "Цель — конечный результат, который вы хотите получить. Должна быть конкретной и достижимой.",
    answers: [
      {
        id: 60301,
        question_id: 603,
        text: "Конечный результат работы",
        is_correct: true,
      },
      { id: 60302, question_id: 603, text: "Список задач", is_correct: false },
      {
        id: 60303,
        question_id: 603,
        text: "Метод исследования",
        is_correct: false,
      },
      { id: 60304, question_id: 603, text: "Объём работы", is_correct: false },
    ],
  },
  {
    id: 604,
    subject_id: 6,
    text: "Что такое гипотеза?",
    explanation:
      "Гипотеза — предположение, которое нужно доказать или опровергнуть в ходе исследования.",
    answers: [
      {
        id: 60401,
        question_id: 604,
        text: "Предположение для проверки",
        is_correct: true,
      },
      { id: 60402, question_id: 604, text: "Факт", is_correct: false },
      { id: 60403, question_id: 604, text: "Вывод", is_correct: false },
      { id: 60404, question_id: 604, text: "Цитата", is_correct: false },
    ],
  },
  {
    id: 605,
    subject_id: 6,
    text: "Сколько должно быть источников в списке литературы?",
    explanation:
      "Обычно требуется 20-30 источников, включая современные (последние 5 лет).",
    answers: [
      {
        id: 60501,
        question_id: 605,
        text: "20-30 источников",
        is_correct: true,
      },
      {
        id: 60502,
        question_id: 605,
        text: "1-5 источников",
        is_correct: false,
      },
      {
        id: 60503,
        question_id: 605,
        text: "100+ источников",
        is_correct: false,
      },
      {
        id: 60504,
        question_id: 605,
        text: "Не имеет значения",
        is_correct: false,
      },
    ],
  },
  {
    id: 606,
    subject_id: 6,
    text: "Что такое объект исследования?",
    explanation:
      "Объект — это процесс или явление, которое изучается в работе.",
    answers: [
      {
        id: 60601,
        question_id: 606,
        text: "Изучаемый процесс или явление",
        is_correct: true,
      },
      { id: 60602, question_id: 606, text: "Автор диплома", is_correct: false },
      {
        id: 60603,
        question_id: 606,
        text: "Принтер для печати",
        is_correct: false,
      },
      {
        id: 60604,
        question_id: 606,
        text: "Научный руководитель",
        is_correct: false,
      },
    ],
  },
  {
    id: 607,
    subject_id: 6,
    text: "Что такое предмет исследования?",
    explanation:
      "Предмет — это конкретные свойства или стороны объекта, которые изучаются.",
    answers: [
      {
        id: 60701,
        question_id: 607,
        text: "Конкретные свойства объекта",
        is_correct: true,
      },
      {
        id: 60702,
        question_id: 607,
        text: "Вся наука целиком",
        is_correct: false,
      },
      {
        id: 60703,
        question_id: 607,
        text: "Стол исследователя",
        is_correct: false,
      },
      {
        id: 60704,
        question_id: 607,
        text: "Список использованной литературы",
        is_correct: false,
      },
    ],
  },
  {
    id: 608,
    subject_id: 6,
    text: "Зачем нужна аннотация?",
    explanation:
      "Аннотация кратко описывает содержание и основные результаты работы.",
    answers: [
      {
        id: 60801,
        question_id: 608,
        text: "Краткое описание работы",
        is_correct: true,
      },
      {
        id: 60802,
        question_id: 608,
        text: "Список опечаток",
        is_correct: false,
      },
      {
        id: 60803,
        question_id: 608,
        text: "Биография автора",
        is_correct: false,
      },
      {
        id: 60804,
        question_id: 608,
        text: "Благодарности друзьям",
        is_correct: false,
      },
    ],
  },
  {
    id: 609,
    subject_id: 6,
    text: "Что такое научная новизна?",
    explanation:
      "Новизна — это то новое, что автор привнес в науку или практику своей работой.",
    answers: [
      {
        id: 60901,
        question_id: 609,
        text: "Новый вклад в науку/практику",
        is_correct: true,
      },
      {
        id: 60902,
        question_id: 609,
        text: "Новая обложка диплома",
        is_correct: false,
      },
      {
        id: 60903,
        question_id: 609,
        text: "Дата сдачи работы",
        is_correct: false,
      },
      {
        id: 60904,
        question_id: 609,
        text: "Использование нового шрифта",
        is_correct: false,
      },
    ],
  },
  {
    id: 610,
    subject_id: 6,
    text: "Для чего используется плагиат-чек?",
    explanation:
      "Для проверки оригинальности текста и отсутствия незаконных заимствований.",
    answers: [
      {
        id: 61001,
        question_id: 610,
        text: "Проверка оригинальности текста",
        is_correct: true,
      },
      {
        id: 61002,
        question_id: 610,
        text: "Проверка грамматики",
        is_correct: false,
      },
      {
        id: 61003,
        question_id: 610,
        text: "Подсчет количества слов",
        is_correct: false,
      },
      {
        id: 61004,
        question_id: 610,
        text: "Проверка скорости печати",
        is_correct: false,
      },
    ],
  },
  {
    id: 611,
    subject_id: 6,
    text: "Что такое практическая значимость?",
    explanation:
      "Возможность применения результатов работы в реальной деятельности или индустрии.",
    answers: [
      {
        id: 61101,
        question_id: 611,
        text: "Применимость результатов на практике",
        is_correct: true,
      },
      {
        id: 61102,
        question_id: 611,
        text: "Вес напечатанного диплома",
        is_correct: false,
      },
      {
        id: 61103,
        question_id: 611,
        text: "Стоимость обучения",
        is_correct: false,
      },
      {
        id: 61104,
        question_id: 611,
        text: "Количество страниц",
        is_correct: false,
      },
    ],
  },
  {
    id: 612,
    subject_id: 6,
    text: "Зачем нужно 'Введение'?",
    explanation:
      "Во введении обосновывается актуальность, формулируются цель, задачи и методы.",
    answers: [
      {
        id: 61201,
        question_id: 612,
        text: "Обоснование актуальности и целей",
        is_correct: true,
      },
      {
        id: 61202,
        question_id: 612,
        text: "Для увеличения объема",
        is_correct: false,
      },
      {
        id: 61203,
        question_id: 612,
        text: "Для рекламы университета",
        is_correct: false,
      },
      {
        id: 61204,
        question_id: 612,
        text: "Список анекдотов",
        is_correct: false,
      },
    ],
  },
  {
    id: 613,
    subject_id: 6,
    text: "Что пишется в 'Заключении'?",
    explanation:
      "В заключении подводятся итоги работы и делаются выводы по поставленным задачам.",
    answers: [
      {
        id: 61301,
        question_id: 613,
        text: "Итоги и выводы всей работы",
        is_correct: true,
      },
      {
        id: 61302,
        question_id: 613,
        text: "Список литературы",
        is_correct: false,
      },
      {
        id: 61303,
        question_id: 613,
        text: "Новые вопросы без ответов",
        is_correct: false,
      },
      {
        id: 61304,
        question_id: 613,
        text: "Планы на отпуск",
        is_correct: false,
      },
    ],
  },
  {
    id: 614,
    subject_id: 6,
    text: "Что такое задачи исследования?",
    explanation:
      "Задачи — это конкретные шаги для достижения поставленной цели.",
    answers: [
      {
        id: 61401,
        question_id: 614,
        text: "Конкретные шаги к цели",
        is_correct: true,
      },
      {
        id: 61402,
        question_id: 614,
        text: "Проблемы с компьютером",
        is_correct: false,
      },
      {
        id: 61403,
        question_id: 614,
        text: "Вопросы на защите",
        is_correct: false,
      },
      {
        id: 61404,
        question_id: 614,
        text: "Список экзаменов",
        is_correct: false,
      },
    ],
  },
  {
    id: 615,
    subject_id: 6,
    text: "Зачем нужна предзащита?",
    explanation:
      "Предварительная проверка готовности диплома и допуска к основной защите.",
    answers: [
      {
        id: 61501,
        question_id: 615,
        text: "Предварительная проверка готовности",
        is_correct: true,
      },
      {
        id: 61502,
        question_id: 615,
        text: "Просто формальность",
        is_correct: false,
      },
      {
        id: 61503,
        question_id: 615,
        text: "Выдача дипломов заранее",
        is_correct: false,
      },
      {
        id: 61504,
        question_id: 615,
        text: "Для сбора денег",
        is_correct: false,
      },
    ],
  },
  {
    id: 616,
    subject_id: 6,
    text: "Что такое ГАК?",
    explanation:
      "Государственная Аттестационная Комиссия, которая принимает защиту диплома.",
    answers: [
      {
        id: 61601,
        question_id: 616,
        text: "Комиссия, принимающая защиту",
        is_correct: true,
      },
      {
        id: 61602,
        question_id: 616,
        text: "Название университета",
        is_correct: false,
      },
      {
        id: 61603,
        question_id: 616,
        text: "Главная Академическая Книга",
        is_correct: false,
      },
      {
        id: 61604,
        question_id: 616,
        text: "Группа активных курсантов",
        is_correct: false,
      },
    ],
  },
  {
    id: 617,
    subject_id: 6,
    text: "Зачем нужен отзыв руководителя?",
    explanation:
      "Характеристика работы и отношения студента к процессу написания диплома.",
    answers: [
      {
        id: 61701,
        question_id: 617,
        text: "Характеристика работы студента",
        is_correct: true,
      },
      {
        id: 61702,
        question_id: 617,
        text: "Для жалобы на студента",
        is_correct: false,
      },
      {
        id: 61703,
        question_id: 617,
        text: "Вместо самого диплома",
        is_correct: false,
      },
      {
        id: 61704,
        question_id: 617,
        text: "Для сайта университета",
        is_correct: false,
      },
    ],
  },
  {
    id: 618,
    subject_id: 6,
    text: "Что такое рецензия на диплом?",
    explanation:
      "Внешняя критическая оценка работы специалистом из другой организации или кафедры.",
    answers: [
      {
        id: 61801,
        question_id: 618,
        text: "Внешняя оценка работы",
        is_correct: true,
      },
      {
        id: 61802,
        question_id: 618,
        text: "Комментарий в соцсетях",
        is_correct: false,
      },
      {
        id: 61803,
        question_id: 618,
        text: "Оценка за практику",
        is_correct: false,
      },
      {
        id: 61804,
        question_id: 618,
        text: "Проверка на ошибки",
        is_correct: false,
      },
    ],
  },
  {
    id: 619,
    subject_id: 6,
    text: "Для чего используется презентация на защите?",
    explanation:
      "Для наглядной иллюстрации основных положений и результатов работы.",
    answers: [
      {
        id: 61901,
        question_id: 619,
        text: "Наглядная иллюстрация результатов",
        is_correct: true,
      },
      { id: 61902, question_id: 619, text: "Для красоты", is_correct: false },
      {
        id: 61903,
        question_id: 619,
        text: "Чтобы не читать текст с листа",
        is_correct: false,
      },
      {
        id: 61904,
        question_id: 619,
        text: "Замена самого доклада",
        is_correct: false,
      },
    ],
  },
  {
    id: 620,
    subject_id: 6,
    text: "Что такое раздаточный материал?",
    explanation:
      "Дополнительные схемы, таблицы или графики, выдаваемые членам комиссии.",
    answers: [
      {
        id: 62001,
        question_id: 620,
        text: "Доп. материалы для комиссии",
        is_correct: true,
      },
      {
        id: 62002,
        question_id: 620,
        text: "Рекламные листовки",
        is_correct: false,
      },
      {
        id: 62003,
        question_id: 620,
        text: "Черновики работы",
        is_correct: false,
      },
      {
        id: 62004,
        question_id: 620,
        text: "Подарки преподавателям",
        is_correct: false,
      },
    ],
  },
  {
    id: 621,
    subject_id: 6,
    text: "Как называется основной текст диплома?",
    explanation:
      "Пояснительная записка — основной документ, описывающий суть проекта.",
    answers: [
      {
        id: 62101,
        question_id: 621,
        text: "Пояснительная записка",
        is_correct: true,
      },
      { id: 62102, question_id: 621, text: "Главная книга", is_correct: false },
      {
        id: 62103,
        question_id: 621,
        text: "Дневник наблюдений",
        is_correct: false,
      },
      { id: 62104, question_id: 621, text: "Научный роман", is_correct: false },
    ],
  },
  {
    id: 622,
    subject_id: 6,
    text: "Что такое ГОСТ?",
    explanation:
      "Государственный стандарт, определяющий правила оформления документов и чертежей.",
    answers: [
      {
        id: 62201,
        question_id: 622,
        text: "Стандарт оформления",
        is_correct: true,
      },
      {
        id: 62202,
        question_id: 622,
        text: "Название программы",
        is_correct: false,
      },
      {
        id: 62203,
        question_id: 622,
        text: "Фамилия ученого",
        is_correct: false,
      },
      { id: 62204, question_id: 622, text: "Тип бумаги", is_correct: false },
    ],
  },
  {
    id: 623,
    subject_id: 6,
    text: "Зачем нужно 'Приложение'?",
    explanation:
      "В приложении выносятся громоздкие таблицы, листинги программ и большие схемы.",
    answers: [
      {
        id: 62301,
        question_id: 623,
        text: "Для выноса больших материалов",
        is_correct: true,
      },
      {
        id: 62302,
        question_id: 623,
        text: "Для личных фото",
        is_correct: false,
      },
      {
        id: 62303,
        question_id: 623,
        text: "Для списка опечаток",
        is_correct: false,
      },
      {
        id: 62304,
        question_id: 623,
        text: "Для подписи автора",
        is_correct: false,
      },
    ],
  },
  {
    id: 624,
    subject_id: 6,
    text: "Что такое теоретическая глава?",
    explanation: "Обзор литературы и существующих решений по теме диплома.",
    answers: [
      {
        id: 62401,
        question_id: 624,
        text: "Обзор литературы и теории",
        is_correct: true,
      },
      { id: 62402, question_id: 624, text: "Описание кода", is_correct: false },
      { id: 62403, question_id: 624, text: "Выводы автора", is_correct: false },
      {
        id: 62404,
        question_id: 624,
        text: "Список сокращений",
        is_correct: false,
      },
    ],
  },
  {
    id: 625,
    subject_id: 6,
    text: "Что такое практическая глава?",
    explanation:
      "Описание реализации, экспериментов или разработок, выполненных автором.",
    answers: [
      {
        id: 62501,
        question_id: 625,
        text: "Описание реализации/разработки",
        is_correct: true,
      },
      {
        id: 62502,
        question_id: 625,
        text: "Только картинки",
        is_correct: false,
      },
      {
        id: 62503,
        question_id: 625,
        text: "Только расчеты",
        is_correct: false,
      },
      {
        id: 62504,
        question_id: 625,
        text: "Только код на языке Go",
        is_correct: false,
      },
    ],
  },
];

// Все вопросы объединены
const allQuestions = {
  1: mathQuestions, // Алгебра
  2: physicsQuestions, // Физика
  3: osQuestions, // ОС
  4: dbQuestions, // Базы данных
  5: mlQuestions, // Машинное обучение
  6: diplomaQuestions, // Дипломный проект
};

async function loadQuestions() {
  try {
    // Получаем вопросы для текущего предмета
    const subjectQuestions = allQuestions[subjectId] || mathQuestions;

    // Берём до 25 вопросов (повторяем если мало)
    questions = [];
    for (let i = 0; i < 25; i++) {
      questions.push(subjectQuestions[i % subjectQuestions.length]);
    }

    console.log("Loaded questions for subject", subjectId, ":", questions);

    if (!questions || questions.length === 0) {
      alert("Вопросы не найдены");
      return;
    }

    // Инициализируем состояния вопросов
    questions.forEach((q, index) => {
      questionStates[index] = "unanswered";
    });

    // Создаем индикаторы вопросов
    createQuestionIndicators();

    // Показываем первый вопрос
    showQuestion(0);
  } catch (error) {
    console.error("Error loading questions:", error);
    alert("Ошибка при загрузке вопросов");
  }
}

function createQuestionIndicators() {
  const indicator = document.getElementById("questionsIndicator");
  indicator.innerHTML = "";

  questions.forEach((q, index) => {
    const dot = document.createElement("div");
    dot.className = "question-indicator";
    dot.textContent = index + 1;
    dot.id = `indicator-${index}`;
    dot.onclick = () => showQuestion(index);
    dot.style.cursor = "pointer";
    indicator.appendChild(dot);
  });
}

window.showQuestion = function (index) {
  if (index < 0 || index >= questions.length) {
    return;
  }

  currentQuestionIndex = index;
  const question = questions[index];

  updateIndicators();

  document.getElementById("questionText").textContent =
    index + 1 + ". " + question.text;

  const answersList = document.getElementById("answersList");
  answersList.innerHTML = "";

  if (!question.answers || question.answers.length === 0) {
    answersList.innerHTML = "<p>Ответы не найдены</p>";
    return;
  }

  hideExplanation();

  const currentState = questionStates[index];
  const selectedAnswerId = userAnswers[question.id];

  question.answers.forEach((answer) => {
    const answerItem = document.createElement("div");
    answerItem.className = "answer-item";
    answerItem.dataset.answerId = answer.id;

    if (currentState !== "unanswered") {
      answerItem.classList.add("disabled");
      if (answer.is_correct) {
        answerItem.classList.add("correct");
      }
      if (selectedAnswerId === answer.id && !answer.is_correct) {
        answerItem.classList.add("incorrect");
      }
    } else {
      answerItem.onclick = () =>
        window.selectAnswer(question.id, answer.id, answer.is_correct);
    }

    answerItem.textContent = answer.text;
    answersList.appendChild(answerItem);
  });

  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const finishBtn = document.getElementById("finishBtn");

  if (index > 0) {
    prevBtn.style.display = "inline-block";
  } else {
    prevBtn.style.display = "none";
  }

  finishBtn.style.display = "inline-block";

  if (currentState !== "unanswered") {
    if (index < questions.length - 1) {
      nextBtn.style.display = "inline-block";
    } else {
      nextBtn.style.display = "none";
    }
  } else {
    nextBtn.style.display = "none";
  }
};

window.selectAnswer = function (questionId, answerId, isCorrect) {
  const currentState = questionStates[currentQuestionIndex];
  if (currentState !== "unanswered") {
    return;
  }

  userAnswers[questionId] = answerId;
  questionStates[currentQuestionIndex] = isCorrect ? "correct" : "incorrect";

  const answersList = document.getElementById("answersList");
  const items = answersList.querySelectorAll(".answer-item");

  items.forEach((item) => {
    const answerIdFromItem = parseInt(item.dataset.answerId);
    item.classList.add("disabled");
    item.onclick = null;

    const answer = questions[currentQuestionIndex].answers.find(
      (a) => a.id === answerIdFromItem
    );
    if (answer) {
      if (answer.is_correct) {
        item.classList.add("correct");
      }

      if (answerIdFromItem === answerId && !isCorrect) {
        item.classList.add("incorrect");
      }
    }
  });

  const nextBtn = document.getElementById("nextBtn");

  if (currentQuestionIndex < questions.length - 1) {
    nextBtn.style.display = "inline-block";
  }

  updateIndicators();

  if (!isCorrect) {
    const question = questions[currentQuestionIndex];
    if (question.explanation) {
      showExplanation(question.explanation);
    }
  }
};

window.prevQuestion = function () {
  if (currentQuestionIndex > 0) {
    window.showQuestion(currentQuestionIndex - 1);
  }
};

window.nextQuestion = function () {
  if (currentQuestionIndex < questions.length - 1) {
    window.showQuestion(currentQuestionIndex + 1);
  }
};

function updateIndicators() {
  questions.forEach((q, index) => {
    const indicator = document.getElementById(`indicator-${index}`);
    if (!indicator) return;

    indicator.classList.remove("current", "correct", "incorrect");

    if (index === currentQuestionIndex) {
      indicator.classList.add("current");
    } else if (questionStates[index] === "correct") {
      indicator.classList.add("correct");
    } else if (questionStates[index] === "incorrect") {
      indicator.classList.add("incorrect");
    }
  });
}

function showCustomConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("customModal");
    const modalMessage = document.getElementById("modalMessage");
    const confirmBtn = document.getElementById("modalConfirm");
    const cancelBtn = document.getElementById("modalCancel");

    modalMessage.textContent = message;
    modal.style.display = "flex";

    const onConfirm = () => {
      modal.style.display = "none";
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      modal.style.display = "none";
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
    };

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
  });
}

window.finishTest = async function () {
  console.log("DEBUG: finishTest started (custom modal version)");
  try {
    const unansweredCount = Object.values(questionStates).filter(
      (state) => state === "unanswered"
    ).length;
    console.log("DEBUG: unansweredCount =", unansweredCount);

    let confirmMsg = "Вы уверены, что хотите завершить тест?";
    if (unansweredCount > 0) {
      confirmMsg =
        "Вы не ответили на " +
        unansweredCount +
        " вопросов. Все равно завершить тест?";
    }

    console.log("DEBUG: Showing custom confirm dialog...");
    const confirmed = await showCustomConfirm(confirmMsg);

    if (!confirmed) {
      console.log("DEBUG: User cancelled completion via custom modal");
      return;
    }
    console.log("DEBUG: User confirmed completion via custom modal");

    let score = 0;
    let totalQuestions = questions.length;
    console.log("DEBUG: totalQuestions =", totalQuestions);

    Object.values(questionStates).forEach((state) => {
      if (state === "correct") {
        score++;
      }
    });
    console.log("DEBUG: Calculated score =", score);

    const answers = [];
    questions.forEach((question) => {
      const selected = userAnswers[question.id];
      if (selected) {
        answers.push({
          question_id: question.id,
          answer_id: selected,
        });
      }
    });
    console.log("DEBUG: Prepared answers count =", answers.length);

    const requestData = {
      subject_id: parseInt(subjectId),
      test_type_id: parseInt(testTypeId),
      score: score,
      total_questions: totalQuestions,
      answers: answers,
    };
    console.log("DEBUG: Sending requestData:", requestData);

    const response = await fetch("/api/tests/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("DEBUG: Server response status:", response.status);

    if (response.ok) {
      const percentage = (score / totalQuestions) * 100;
      console.log("DEBUG: Success, percentage:", percentage);

      document.getElementById("questionContainer").style.display = "none";
      document.getElementById("resultContainer").style.display = "block";
      document.getElementById("resultScore").textContent = score;
      document.getElementById("resultTotal").textContent = totalQuestions;

      updateCircularProgress(percentage);
      console.log("DEBUG: Result view updated");
    } else {
      const errorText = await response.text();
      console.error("DEBUG: Server error text:", errorText);
      alert("Ошибка при сохранении результата: " + errorText);
    }
  } catch (err) {
    console.error("DEBUG: CRITICAL ERROR IN finishTest:", err);
    alert("Критическая ошибка: " + err.message);
  }
};

function updateCircularProgress(percentage) {
  const circle = document.querySelector(".progress-circle");
  const percentageText = document.getElementById("circularPercentage");

  if (circle && percentageText) {
    const circumference = 2 * Math.PI * 90; // radius = 90 (соответствует r="90" в SVG)
    const offset = circumference - (percentage / 100) * circumference;

    // Устанавливаем начальное значение для анимации
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;

    // Небольшая задержка для запуска анимации
    setTimeout(() => {
      circle.style.strokeDashoffset = offset;
      percentageText.textContent = percentage.toFixed(1);
    }, 100);
  }
}

// Показываем объяснение при неправильном ответе
function showExplanation(explanation) {
  let explanationBox = document.getElementById("explanationBox");
  if (!explanationBox) {
    explanationBox = document.createElement("div");
    explanationBox.id = "explanationBox";
    explanationBox.className = "explanation-box";
    document.getElementById("answersList").after(explanationBox);
  }

  explanationBox.innerHTML = `
        <div class="explanation-header">Объяснение:</div>
        <p>${explanation}</p>
    `;
  explanationBox.classList.remove("hidden");
}

// Скрываем объяснение
function hideExplanation() {
  const explanationBox = document.getElementById("explanationBox");
  if (explanationBox) {
    explanationBox.classList.add("hidden");
  }
}

// Загружаем вопросы при загрузке страницы
loadQuestions();
