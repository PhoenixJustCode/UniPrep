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
			text TEXT NOT NULL
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
	return nil
}
