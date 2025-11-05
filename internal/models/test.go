package models

type Course struct {
	ID   int    `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

type Subject struct {
	ID       int    `json:"id" db:"id"`
	CourseID int    `json:"course_id" db:"course_id"`
	Name     string `json:"name" db:"name"`
}

type TestType struct {
	ID   int    `json:"id" db:"id"`
	Name string `json:"name" db:"name"` // РК1, РК2, Экзамен
}

type Question struct {
	ID        int      `json:"id" db:"id"`
	SubjectID int      `json:"subject_id" db:"subject_id"`
	Text      string   `json:"text" db:"text"`
	Answers   []Answer `json:"answers"`
}

type Answer struct {
	ID         int    `json:"id" db:"id"`
	QuestionID int    `json:"question_id" db:"question_id"`
	Text       string `json:"text" db:"text"`
	IsCorrect  bool   `json:"is_correct" db:"is_correct"`
}

type TestSession struct {
	ID           int    `json:"id" db:"id"`
	UserID       int    `json:"user_id" db:"user_id"`
	SubjectID    int    `json:"subject_id" db:"subject_id"`
	TestTypeID   int    `json:"test_type_id" db:"test_type_id"`
	Score        int    `json:"score" db:"score"`
	TotalQuestions int `json:"total_questions" db:"total_questions"`
	CompletedAt  string `json:"completed_at" db:"completed_at"`
}

type UserAnswer struct {
	QuestionID int `json:"question_id"`
	AnswerID   int `json:"answer_id"`
}
