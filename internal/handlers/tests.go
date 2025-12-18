package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"uniprep/internal/database"
	"uniprep/internal/models"

	"github.com/gorilla/mux"
)

func GetCourses(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, name FROM courses ORDER BY id")
	if err != nil {
		http.Error(w, "Failed to fetch courses", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var courses []models.Course
	for rows.Next() {
		var course models.Course
		if err := rows.Scan(&course.ID, &course.Name); err != nil {
			continue
		}
		courses = append(courses, course)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(courses)
}

func GetSubjects(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	courseID, err := strconv.Atoi(vars["courseId"])
	if err != nil {
		http.Error(w, "Invalid course ID", http.StatusBadRequest)
		return
	}

	rows, err := database.DB.Query("SELECT id, course_id, name FROM subjects WHERE course_id = $1 ORDER BY id", courseID)
	if err != nil {
		http.Error(w, "Failed to fetch subjects", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var subjects []models.Subject
	for rows.Next() {
		var subject models.Subject
		if err := rows.Scan(&subject.ID, &subject.CourseID, &subject.Name); err != nil {
			continue
		}
		subjects = append(subjects, subject)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subjects)
}

func GetTestTypes(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, name FROM test_types ORDER BY id")
	if err != nil {
		http.Error(w, "Failed to fetch test types", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var testTypes []models.TestType
	for rows.Next() {
		var tt models.TestType
		if err := rows.Scan(&tt.ID, &tt.Name); err != nil {
			continue
		}
		testTypes = append(testTypes, tt)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(testTypes)
}

func GetTestQuestions(w http.ResponseWriter, r *http.Request) {
	fmt.Println("[DEBUG] GetTestQuestions called")

	session, _ := SessionStore.Get(r, "session")
	userID, ok := session.Values["user_id"].(int)
	if !ok {
		fmt.Println("[DEBUG] Unauthorized - no user_id in session")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	fmt.Printf("[DEBUG] User ID: %d\n", userID)

	vars := mux.Vars(r)
	fmt.Printf("[DEBUG] URL vars: %+v\n", vars)

	subjectID, err := strconv.Atoi(vars["subjectId"])
	if err != nil {
		fmt.Printf("[DEBUG] Invalid subject ID: %v\n", err)
		http.Error(w, "Invalid subject ID", http.StatusBadRequest)
		return
	}
	fmt.Printf("[DEBUG] Subject ID: %d\n", subjectID)

	testTypeID, err := strconv.Atoi(vars["testTypeId"])
	if err != nil {
		fmt.Printf("[DEBUG] Invalid test type ID: %v\n", err)
		http.Error(w, "Invalid test type ID", http.StatusBadRequest)
		return
	}
	fmt.Printf("[DEBUG] Test Type ID: %d\n", testTypeID)

	// Получаем все вопросы по предмету
	rows, err := database.DB.Query("SELECT id, subject_id, text, COALESCE(explanation, '') as explanation FROM questions WHERE subject_id = $1", subjectID)
	if err != nil {
		fmt.Printf("[DEBUG] DB Query error: %v\n", err)
		http.Error(w, fmt.Sprintf("Failed to fetch questions: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var allQuestions []models.Question
	for rows.Next() {
		var q models.Question
		q.Answers = []models.Answer{} // Инициализируем пустой слайс
		if err := rows.Scan(&q.ID, &q.SubjectID, &q.Text, &q.Explanation); err != nil {
			fmt.Printf("[DEBUG] Scan error: %v\n", err)
			continue
		}
		fmt.Printf("[DEBUG] Found question ID=%d: %s\n", q.ID, q.Text)

		// Получаем ответы для вопроса
		answerRows, err := database.DB.Query(
			"SELECT id, question_id, text, is_correct FROM answers WHERE question_id = $1 ORDER BY id",
			q.ID,
		)
		if err == nil {
			for answerRows.Next() {
				var a models.Answer
				if err := answerRows.Scan(&a.ID, &a.QuestionID, &a.Text, &a.IsCorrect); err == nil {
					q.Answers = append(q.Answers, a)
				}
			}
			answerRows.Close()
		}
		fmt.Printf("[DEBUG] Question %d has %d answers\n", q.ID, len(q.Answers))

		// Добавляем только вопросы, у которых есть ответы
		if len(q.Answers) > 0 {
			allQuestions = append(allQuestions, q)
		}
	}

	fmt.Printf("[DEBUG] Total questions with answers: %d\n", len(allQuestions))

	// Формируем список из 25 вопросов
	var questions []models.Question
	if len(allQuestions) > 0 {
		// Используем все доступные вопросы, повторяя их если нужно до 25
		for i := 0; i < 25; i++ {
			// Берём вопрос по циклическому индексу
			baseQuestion := allQuestions[i%len(allQuestions)]

			// Создаем копию вопроса
			q := models.Question{
				ID:          baseQuestion.ID,
				SubjectID:   baseQuestion.SubjectID,
				Text:        baseQuestion.Text,
				Explanation: baseQuestion.Explanation,
				Answers:     make([]models.Answer, 0, len(baseQuestion.Answers)),
			}
			// Копируем ответы
			for _, ans := range baseQuestion.Answers {
				q.Answers = append(q.Answers, models.Answer{
					ID:         ans.ID,
					QuestionID: ans.QuestionID,
					Text:       ans.Text,
					IsCorrect:  ans.IsCorrect,
				})
			}
			questions = append(questions, q)
		}
		fmt.Printf("[DEBUG] Returning %d questions\n", len(questions))
	} else {
		// Если вопросов нет, возвращаем пустой массив с сообщением
		fmt.Println("[DEBUG] No questions found, returning empty array")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]models.Question{})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}

func SubmitTest(w http.ResponseWriter, r *http.Request) {
	session, _ := SessionStore.Get(r, "session")
	userID, ok := session.Values["user_id"].(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		SubjectID      int `json:"subject_id"`
		TestTypeID     int `json:"test_type_id"`
		Score          int `json:"score"`
		TotalQuestions int `json:"total_questions"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Printf("[DEBUG] SubmitTest decode error: %v\n", err)
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	fmt.Printf("[DEBUG] SubmitTest received: %+v\n", req)

	// Since we are using hardcoded questions in the frontend,
	// we trust the score sent by the frontend for now.
	score := req.Score
	totalQuestions := req.TotalQuestions

	// Validation skipped because questions are in JS

	// Сохраняем результат теста
	var sessionID int
	err := database.DB.QueryRow(
		"INSERT INTO test_sessions (user_id, subject_id, test_type_id, score, total_questions) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		userID, req.SubjectID, req.TestTypeID, score, totalQuestions,
	).Scan(&sessionID)

	if err != nil {
		http.Error(w, "Failed to save test result", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":         true,
		"score":           score,
		"total_questions": totalQuestions,
		"percentage":      float64(score) / float64(totalQuestions) * 100,
	})
}

func GetTestHistory(w http.ResponseWriter, r *http.Request) {
	session, _ := SessionStore.Get(r, "session")
	userID, ok := session.Values["user_id"].(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := database.DB.Query(
		`SELECT ts.id, ts.subject_id, ts.test_type_id, ts.score, ts.total_questions, ts.completed_at,
			s.name as subject_name, tt.name as test_type_name
		 FROM test_sessions ts
		 JOIN subjects s ON ts.subject_id = s.id
		 JOIN test_types tt ON ts.test_type_id = tt.id
		 WHERE ts.user_id = $1
		 ORDER BY ts.completed_at DESC
		 LIMIT 20`,
		userID,
	)

	if err != nil {
		http.Error(w, "Failed to fetch test history", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var history []map[string]interface{}
	for rows.Next() {
		var session models.TestSession
		var subjectName, testTypeName string
		if err := rows.Scan(&session.ID, &session.SubjectID, &session.TestTypeID,
			&session.Score, &session.TotalQuestions, &session.CompletedAt,
			&subjectName, &testTypeName); err != nil {
			continue
		}

		history = append(history, map[string]interface{}{
			"id":              session.ID,
			"subject_id":      session.SubjectID,
			"subject_name":    subjectName,
			"test_type_id":    session.TestTypeID,
			"test_type_name":  testTypeName,
			"score":           session.Score,
			"total_questions": session.TotalQuestions,
			"completed_at":    session.CompletedAt,
			"percentage":      float64(session.Score) / float64(session.TotalQuestions) * 100,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}

func DeleteTestHistory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	session, _ := SessionStore.Get(r, "session")
	userID, ok := session.Values["user_id"].(int)
	if !ok {
		log.Printf("DELETE: User not authorized")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	vars := mux.Vars(r)
	sessionID, err := strconv.Atoi(vars["sessionId"])
	if err != nil {
		log.Printf("DELETE: Invalid session ID: %v", vars["sessionId"])
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid session ID"})
		return
	}

	log.Printf("DELETE: User %d attempting to delete session %d", userID, sessionID)

	// Проверяем, что сессия принадлежит текущему пользователю
	var ownerID int
	err = database.DB.QueryRow(
		"SELECT user_id FROM test_sessions WHERE id = $1",
		sessionID,
	).Scan(&ownerID)

	if err != nil {
		log.Printf("DELETE: Session %d not found in DB: %v", sessionID, err)
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Session not found"})
		return
	}

	if ownerID != userID {
		log.Printf("DELETE: User %d is not the owner of session %d (owner is %d)", userID, sessionID, ownerID)
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "Forbidden"})
		return
	}

	// Удаляем сессию
	_, err = database.DB.Exec("DELETE FROM test_sessions WHERE id = $1", sessionID)
	if err != nil {
		log.Printf("DELETE: Failed to delete session %d: %v", sessionID, err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete session"})
		return
	}

	log.Printf("DELETE: Session %d successfully deleted", sessionID)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
