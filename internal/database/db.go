package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB(connStr string) error {
	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Database connected successfully")

	// Создание таблиц
	if err = createTables(); err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	// Вставка начальных данных
	if err = seedData(); err != nil {
		return fmt.Errorf("failed to seed data: %w", err)
	}

	return nil
}

func createTables() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			email VARCHAR(255) UNIQUE NOT NULL,
			password VARCHAR(255) NOT NULL,
			name VARCHAR(255),
			phone VARCHAR(50),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE TABLE IF NOT EXISTS courses (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL
		)`,

		`CREATE TABLE IF NOT EXISTS subjects (
			id SERIAL PRIMARY KEY,
			course_id INTEGER REFERENCES courses(id),
			name VARCHAR(255) NOT NULL
		)`,

		`CREATE TABLE IF NOT EXISTS test_types (
			id SERIAL PRIMARY KEY,
			name VARCHAR(50) NOT NULL
		)`,

		`CREATE TABLE IF NOT EXISTS questions (
			id SERIAL PRIMARY KEY,
			subject_id INTEGER REFERENCES subjects(id),
			text TEXT NOT NULL,
			explanation TEXT DEFAULT ''
		)`,

		`CREATE TABLE IF NOT EXISTS answers (
			id SERIAL PRIMARY KEY,
			question_id INTEGER REFERENCES questions(id),
			text TEXT NOT NULL,
			is_correct BOOLEAN NOT NULL DEFAULT FALSE
		)`,

		`CREATE TABLE IF NOT EXISTS test_sessions (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id),
			subject_id INTEGER REFERENCES subjects(id),
			test_type_id INTEGER REFERENCES test_types(id),
			score INTEGER NOT NULL,
			total_questions INTEGER NOT NULL,
			completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
	}

	for _, query := range queries {
		if _, err := DB.Exec(query); err != nil {
			return fmt.Errorf("failed to execute query: %w", err)
		}
	}

	log.Println("Tables created successfully")
	return nil
}

func seedData() error {
	// Проверяем, есть ли уже данные
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM courses").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		log.Println("Data already seeded")
		// Всё равно проверяем математические вопросы
		if err := seedMathQuestions(); err != nil {
			log.Printf("Warning: failed to seed math questions: %v", err)
		}
		return nil
	}

	// Курсы
	courses := []string{"1-й курс", "2-й курс", "3-й курс", "4-й курс"}
	for _, courseName := range courses {
		_, err := DB.Exec("INSERT INTO courses (name) VALUES ($1) ON CONFLICT DO NOTHING", courseName)
		if err != nil {
			return err
		}
	}

	// Типы тестов
	testTypes := []string{"РК1", "РК2", "Экзамен"}
	for _, testType := range testTypes {
		_, err := DB.Exec("INSERT INTO test_types (name) VALUES ($1) ON CONFLICT DO NOTHING", testType)
		if err != nil {
			return err
		}
	}

	// Предметы и вопросы (мок-данные для MVP)
	subjects := []struct {
		courseID int
		name     string
	}{
		{1, "Алгебра"},
		{1, "Физика"},
		{2, "ОС"},
		{2, "Базы данных"},
		{3, "Машинное обучение"},
		{4, "Дипломный проект"},
	}

	for _, subj := range subjects {
		var subjectID int
		err := DB.QueryRow("INSERT INTO subjects (course_id, name) VALUES ($1, $2) RETURNING id", subj.courseID, subj.name).Scan(&subjectID)
		if err != nil {
			return err
		}

		// Создаем один вопрос для каждого предмета (для MVP)
		var questionID int
		questionText := fmt.Sprintf("Вопрос по предмету %s", subj.name)
		err = DB.QueryRow("INSERT INTO questions (subject_id, text) VALUES ($1, $2) RETURNING id", subjectID, questionText).Scan(&questionID)
		if err != nil {
			return err
		}

		// Создаем 4 ответа, один правильный
		answers := []struct {
			text      string
			isCorrect bool
		}{
			{"Правильный ответ", true},
			{"Неправильный ответ 1", false},
			{"Неправильный ответ 2", false},
			{"Неправильный ответ 3", false},
		}

		for _, ans := range answers {
			_, err = DB.Exec("INSERT INTO answers (question_id, text, is_correct) VALUES ($1, $2, $3)",
				questionID, ans.text, ans.isCorrect)
			if err != nil {
				return err
			}
		}
	}

	// Добавляем дополнительные вопросы для тестирования
	// Добавим еще несколько вопросов по каждому предмету
	subjectsWithQuestions := []struct {
		courseID  int
		name      string
		questions []struct {
			text    string
			answers []struct {
				text      string
				isCorrect bool
			}
		}
	}{
		{
			1, "Алгебра",
			[]struct {
				text    string
				answers []struct {
					text      string
					isCorrect bool
				}
			}{
				{
					"Что такое производная функции?",
					[]struct {
						text      string
						isCorrect bool
					}{
						{"Предел отношения приращения функции к приращению аргумента", true},
						{"Сумма всех значений функции", false},
						{"Интеграл функции", false},
						{"Среднее значение функции", false},
					},
				},
			},
		},
		{
			1, "Физика",
			[]struct {
				text    string
				answers []struct {
					text      string
					isCorrect bool
				}
			}{
				{
					"Что такое закон Ньютона?",
					[]struct {
						text      string
						isCorrect bool
					}{
						{"F = ma (сила равна произведению массы на ускорение)", true},
						{"E = mc²", false},
						{"PV = nRT", false},
						{"v = λf", false},
					},
				},
			},
		},
		{
			2, "ОС",
			[]struct {
				text    string
				answers []struct {
					text      string
					isCorrect bool
				}
			}{
				{
					"Что такое процесс в операционной системе?",
					[]struct {
						text      string
						isCorrect bool
					}{
						{"Выполняющаяся программа со своим адресным пространством", true},
						{"Физический компонент компьютера", false},
						{"Тип файла", false},
						{"Системная утилита", false},
					},
				},
			},
		},
		{
			2, "Базы данных",
			[]struct {
				text    string
				answers []struct {
					text      string
					isCorrect bool
				}
			}{
				{
					"Что такое SQL?",
					[]struct {
						text      string
						isCorrect bool
					}{
						{"Язык структурированных запросов для работы с БД", true},
						{"Тип базы данных", false},
						{"Система управления файлами", false},
						{"Язык программирования", false},
					},
				},
			},
		},
		{
			3, "Машинное обучение",
			[]struct {
				text    string
				answers []struct {
					text      string
					isCorrect bool
				}
			}{
				{
					"Что такое нейронная сеть?",
					[]struct {
						text      string
						isCorrect bool
					}{
						{"Вычислительная модель, основанная на нейронах мозга", true},
						{"Физическая сеть компьютеров", false},
						{"Тип базы данных", false},
						{"Операционная система", false},
					},
				},
			},
		},
		{
			4, "Дипломный проект",
			[]struct {
				text    string
				answers []struct {
					text      string
					isCorrect bool
				}
			}{
				{
					"Что включает в себя дипломный проект?",
					[]struct {
						text      string
						isCorrect bool
					}{
						{"Исследование, разработка и презентация проекта", true},
						{"Только написание кода", false},
						{"Только теоретическая часть", false},
						{"Только презентация", false},
					},
				},
			},
		},
	}

	// Добавляем дополнительные вопросы (только если их еще нет)
	for _, subj := range subjectsWithQuestions {
		var subjectID int
		err := DB.QueryRow("SELECT id FROM subjects WHERE course_id = $1 AND name = $2", subj.courseID, subj.name).Scan(&subjectID)
		if err != nil {
			continue // Пропускаем если предмет не найден
		}

		for _, qData := range subj.questions {
			// Проверяем, существует ли уже такой вопрос
			var existingQuestionID int
			checkErr := DB.QueryRow("SELECT id FROM questions WHERE subject_id = $1 AND text = $2", subjectID, qData.text).Scan(&existingQuestionID)
			if checkErr == nil {
				continue // Вопрос уже существует
			}

			var questionID int
			err = DB.QueryRow("INSERT INTO questions (subject_id, text) VALUES ($1, $2) RETURNING id", subjectID, qData.text).Scan(&questionID)
			if err != nil {
				continue
			}

			for _, ans := range qData.answers {
				_, err = DB.Exec("INSERT INTO answers (question_id, text, is_correct) VALUES ($1, $2, $3)",
					questionID, ans.text, ans.isCorrect)
				if err != nil {
					continue
				}
			}
		}
	}

	log.Println("Data seeded successfully")

	// Добавляем реальные математические вопросы
	if err := seedMathQuestions(); err != nil {
		log.Printf("Warning: failed to seed math questions: %v", err)
	}

	return nil
}

// seedMathQuestions добавляет реальные математические вопросы по Алгебре
func seedMathQuestions() error {
	// Находим ID предмета "Алгебра"
	var algebraID int
	err := DB.QueryRow("SELECT id FROM subjects WHERE name = 'Алгебра'").Scan(&algebraID)
	if err != nil {
		return fmt.Errorf("algebra subject not found: %w", err)
	}

	mathQuestions := []struct {
		text        string
		explanation string
		answers     []struct {
			text      string
			isCorrect bool
		}
	}{
		{
			text:        "300 ÷ 10 = ?",
			explanation: "Чтобы разделить число на 10, нужно убрать один ноль справа. 300 ÷ 10 = 30",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"30", true},
				{"3", false},
				{"300", false},
				{"3000", false},
			},
		},
		{
			text:        "25 × 4 = ?",
			explanation: "25 × 4 — это то же самое, что 25 × 2 × 2 = 50 × 2 = 100. Или можно запомнить: 25 × 4 всегда равно 100.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"100", true},
				{"90", false},
				{"125", false},
				{"80", false},
			},
		},
		{
			text:        "144 ÷ 12 = ?",
			explanation: "144 — это 12 × 12 (12 в квадрате). Поэтому 144 ÷ 12 = 12.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"12", true},
				{"14", false},
				{"11", false},
				{"13", false},
			},
		},
		{
			text:        "15 + 27 = ?",
			explanation: "Складываем: 15 + 27. Сначала единицы: 5 + 7 = 12 (записываем 2, переносим 1). Потом десятки: 1 + 2 + 1 = 4. Ответ: 42.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"42", true},
				{"32", false},
				{"52", false},
				{"41", false},
			},
		},
		{
			text:        "81 ÷ 9 = ?",
			explanation: "81 — это 9 × 9 (9 в квадрате). Поэтому 81 ÷ 9 = 9.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"9", true},
				{"8", false},
				{"7", false},
				{"10", false},
			},
		},
		{
			text:        "50 - 18 = ?",
			explanation: "50 - 18: сначала вычитаем 20 (получаем 30), потом прибавляем 2 (потому что вычли на 2 больше). Ответ: 32.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"32", true},
				{"42", false},
				{"28", false},
				{"38", false},
			},
		},
		{
			text:        "7 × 8 = ?",
			explanation: "7 × 8 = 56. Полезно запомнить: 5, 6, 7, 8 → 56 = 7 × 8.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"56", true},
				{"54", false},
				{"63", false},
				{"48", false},
			},
		},
		{
			text:        "1000 - 347 = ?",
			explanation: "От 1000 отнимаем 347: 1000 - 347 = 653. Проще: 999 - 347 = 652, потом +1 = 653.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"653", true},
				{"753", false},
				{"553", false},
				{"663", false},
			},
		},
		{
			text:        "36 ÷ 4 = ?",
			explanation: "36 ÷ 4: сколько раз 4 помещается в 36? 4 × 9 = 36, значит ответ 9.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"9", true},
				{"8", false},
				{"6", false},
				{"12", false},
			},
		},
		{
			text:        "125 × 8 = ?",
			explanation: "125 × 8 = 1000. Это полезно запомнить: 125 — это 1000 ÷ 8.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"1000", true},
				{"800", false},
				{"900", false},
				{"1125", false},
			},
		},
		{
			text:        "64 ÷ 8 = ?",
			explanation: "64 — это 8 × 8 (8 в квадрате). Поэтому 64 ÷ 8 = 8.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"8", true},
				{"6", false},
				{"7", false},
				{"9", false},
			},
		},
		{
			text:        "45 + 38 = ?",
			explanation: "45 + 38: складываем единицы 5 + 8 = 13 (пишем 3, переносим 1). Десятки: 4 + 3 + 1 = 8. Ответ: 83.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"83", true},
				{"73", false},
				{"93", false},
				{"82", false},
			},
		},
		{
			text:        "9 × 9 = ?",
			explanation: "9 × 9 = 81. Девять девяток — это 81.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"81", true},
				{"72", false},
				{"90", false},
				{"89", false},
			},
		},
		{
			text:        "200 - 75 = ?",
			explanation: "200 - 75: проще сначала 200 - 80 = 120, потом +5 = 125.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"125", true},
				{"115", false},
				{"135", false},
				{"175", false},
			},
		},
		{
			text:        "12 × 12 = ?",
			explanation: "12 × 12 = 144. Это полезно запомнить: 12 в квадрате равно 144.",
			answers: []struct {
				text      string
				isCorrect bool
			}{
				{"144", true},
				{"124", false},
				{"132", false},
				{"156", false},
			},
		},
	}

	// Вставляем вопросы
	for _, q := range mathQuestions {
		// Проверяем, существует ли уже такой вопрос
		var existingID int
		checkErr := DB.QueryRow("SELECT id FROM questions WHERE subject_id = $1 AND text = $2", algebraID, q.text).Scan(&existingID)
		if checkErr == nil {
			continue // Вопрос уже существует
		}

		var questionID int
		err = DB.QueryRow(
			"INSERT INTO questions (subject_id, text, explanation) VALUES ($1, $2, $3) RETURNING id",
			algebraID, q.text, q.explanation,
		).Scan(&questionID)
		if err != nil {
			continue
		}

		for _, ans := range q.answers {
			_, err = DB.Exec("INSERT INTO answers (question_id, text, is_correct) VALUES ($1, $2, $3)",
				questionID, ans.text, ans.isCorrect)
			if err != nil {
				continue
			}
		}
	}

	log.Println("Math questions seeded successfully")
	return nil
}
