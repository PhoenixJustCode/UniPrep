# Инструкция по установке и запуску UniPrep

## Шаг 1: Установка PostgreSQL

### Windows:
1. Скачайте PostgreSQL с официального сайта: https://www.postgresql.org/download/windows/
2. Установите PostgreSQL, запомните пароль для пользователя `postgres`
3. PostgreSQL будет запущен как служба Windows

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS:
```bash
brew install postgresql
brew services start postgresql
```

## Шаг 2: Создание базы данных

Подключитесь к PostgreSQL:

```bash
# Windows (если PostgreSQL добавлен в PATH)
psql -U postgres

# Linux/macOS
sudo -u postgres psql
```

В консоли PostgreSQL выполните:

```sql
CREATE DATABASE uniprep;
\q
```

## Шаг 3: Установка Go

1. Скачайте Go с https://golang.org/dl/
2. Установите Go
3. Проверьте установку:
```bash
go version
```

## Шаг 4: Клонирование/Настройка проекта

Если проект еще не скачан, перейдите в нужную директорию:

```bash
cd D:\2.GO\PetProjects\MoneyProjects\UniPrep
```

## Шаг 5: Установка зависимостей Go

```bash
go mod download
```

Это автоматически установит все необходимые пакеты из `go.mod`.

## Шаг 6: Настройка строки подключения к БД

По умолчанию в `cmd/server/main.go` используется строка:
```
postgres://postgres:postgres@localhost/uniprep?sslmode=disable
```

Если у вас другой пароль или пользователь, отредактируйте файл `cmd/server/main.go` или установите переменную окружения:

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgres://postgres:ВАШ_ПАРОЛЬ@localhost/uniprep?sslmode=disable"
```

**Linux/macOS:**
```bash
export DATABASE_URL="postgres://postgres:ВАШ_ПАРОЛЬ@localhost/uniprep?sslmode=disable"
```

## Шаг 7: Запуск приложения

### Вариант 1: Прямой запуск (для разработки)

```bash
go run cmd/server/main.go
```

Или с указанием порта и БД:

```bash
go run cmd/server/main.go -port=8080 -db="postgres://postgres:postgres@localhost/uniprep?sslmode=disable"
```

### Вариант 2: Сборка и запуск

```bash
# Сборка
go build -o uniprep.exe cmd/server/main.go

# Запуск (Windows)
.\uniprep.exe

# Запуск (Linux/macOS)
./uniprep
```

## Шаг 8: Открытие приложения

Откройте браузер и перейдите по адресу:
```
http://localhost:8080
```

## Первый запуск

При первом запуске:
1. Приложение автоматически создаст все необходимые таблицы
2. Заполнит базу данных начальными данными (курсы, предметы, мок-вопросы)
3. Вы сможете зарегистрировать первого пользователя

## Тестирование приложения

1. Зарегистрируйтесь с любым email и паролем
2. Войдите в систему
3. Перейдите в раздел "Тесты"
4. Выберите курс → предмет → тип теста (РК1, РК2, Экзамен)
5. Пройдите тест из 25 вопросов
6. Посмотрите результаты в профиле

## Возможные проблемы

### Ошибка подключения к БД
- Убедитесь, что PostgreSQL запущен
- Проверьте правильность строки подключения
- Убедитесь, что база данных `uniprep` создана

### Ошибка "port already in use"
- Измените порт в параметрах запуска: `-port=8081`
- Или остановите приложение, использующее порт 8080

### Ошибки компиляции
- Убедитесь, что версия Go >= 1.21
- Выполните `go mod tidy` для очистки зависимостей
- Проверьте, что все файлы на месте

## Остановка приложения

Нажмите `Ctrl+C` в терминале, где запущено приложение.
