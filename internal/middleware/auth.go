package middleware

import (
	"net/http"

	"github.com/gorilla/sessions"
)

var sessionStore = sessions.NewCookieStore([]byte("super-secret-key-change-in-production"))

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := sessionStore.Get(r, "session")
		userID, ok := session.Values["user_id"].(int)
		if !ok || userID == 0 {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next(w, r)
	}
}
