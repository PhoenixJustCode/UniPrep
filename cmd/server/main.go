package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"uniprep/internal/database"
	"uniprep/internal/handlers"
	"uniprep/internal/middleware"

	"github.com/gorilla/mux"
)

func main() {
	port := flag.String("port", "8080", "Server port")
	connStr := flag.String("db", "postgres://postgres:postgres@localhost/uniprep?sslmode=disable", "Database connection string")
	flag.Parse()

	// Инициализация базы данных
	if dbEnv := os.Getenv("DATABASE_URL"); dbEnv != "" {
		connStr = &dbEnv
	}

	if err := database.InitDB(*connStr); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Настройка роутера
	r := mux.NewRouter()

	// Статические файлы
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./frontend/static/"))))

	// API маршруты
	api := r.PathPrefix("/api").Subrouter()
	middleware.Init()
	// Аутентификация
	api.HandleFunc("/register", handlers.Register).Methods("POST")
	api.HandleFunc("/login", handlers.Login).Methods("POST")
	api.HandleFunc("/logout", handlers.Logout).Methods("POST")
	api.HandleFunc("/profile", handlers.GetProfile).Methods("GET")
	api.HandleFunc("/profile", handlers.UpdateProfile).Methods("PUT")

	// Тесты
	api.HandleFunc("/courses", handlers.GetCourses).Methods("GET")
	api.HandleFunc("/courses/{courseId}/subjects", handlers.GetSubjects).Methods("GET")
	api.HandleFunc("/test-types", handlers.GetTestTypes).Methods("GET")
	api.HandleFunc("/subjects/{subjectId}/test-types/{testTypeId}/questions", handlers.GetTestQuestions).Methods("GET")
	api.HandleFunc("/tests/submit", handlers.SubmitTest).Methods("POST")
	api.HandleFunc("/tests/history", handlers.GetTestHistory).Methods("GET")
	api.HandleFunc("/tests/history/{sessionId}", handlers.DeleteTestHistory).Methods("DELETE")

	// Главная страница
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./frontend/templates/index.html")
	})

	r.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./frontend/templates/login.html")
	})

	r.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./frontend/templates/register.html")
	})

	r.HandleFunc("/tests", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./frontend/templates/tests.html")
	})

	r.HandleFunc("/profile", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./frontend/templates/profile.html")
	})

	r.HandleFunc("/test/{subjectId}/{testTypeId}", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./frontend/templates/test.html")
	})

	log.Printf("Server starting on port %s", *port)
	log.Fatal(http.ListenAndServe(":"+*port, r))
}
