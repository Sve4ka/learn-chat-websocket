package cerr

import (
	"fmt"
	"runtime"
)

// ErrorType определяет тип ошибки
type ErrorType string

const (
	TransactionType  ErrorType = "transaction error"
	RollbackType     ErrorType = "rollback error"
	CommitType       ErrorType = "commit error"
	ScanType         ErrorType = "scan error"
	ExecutionType    ErrorType = "execution error"
	ExecContextType  ErrorType = "transaction.ExecContext error"
	RowsType         ErrorType = "rows error"
	NoOneRowType     ErrorType = "row count doesnt equals 1"
	InvalidLoginType ErrorType = "invalid login"
	InvalidEmailType ErrorType = "invalid email"
	InvalidPWDType   ErrorType = "invalid password"
	InvalidCountType ErrorType = "count more that have"
	InvalidType      ErrorType = "give not needn't name type"
	DiffPWDType      ErrorType = "pwd not equal"
	HashType         ErrorType = "error in hashing time"
	NotFoundType     ErrorType = "this row not found"
	JSONType         ErrorType = "json error"
)

// CustomError структура для кастомной ошибки
type CustomError struct {
	Type ErrorType
	Err  error
}

// Error метод для реализации интерфейса error
func (e CustomError) Error() error {
	return fmt.Errorf("Error Type: %v, Error: %v", e.Type, e.Err)
}

// Str метод для реализации ошибки в строку
func (e CustomError) Str() string {
	return fmt.Sprintf("Error Type: %v, Error: %v", e.Type, e.Err)
}

// Err функция для создания новой кастомной ошибки
func Err(errType ErrorType, err error) CustomError {
	return CustomError{Type: errType, Err: err}
}

func Transaction(err error) error {
	_, file, line, ok := runtime.Caller(1) // 1 - уровень вызова
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", TransactionType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", TransactionType, err, file, line)
}

func Rollback(err error) error {
	_, file, line, ok := runtime.Caller(1) // 1 - уровень вызова
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", RollbackType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", RollbackType, err, file, line)
}

func Commit(err error) error {
	_, file, line, ok := runtime.Caller(1) // 1 - уровень вызова
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", CommitType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", CommitType, err, file, line)
}

func Scan(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", ScanType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", ScanType, err, file, line)
}

func Execution(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", ExecutionType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", ExecutionType, err, file, line)
}

func ExecContext(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", ExecContextType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", ExecContextType, err, file, line)
}

func Rows(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", RowsType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", RowsType, err, file, line)
}

func NoOneRow(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", NoOneRowType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", NoOneRowType, err, file, line)
}

func InvalidLogin(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", InvalidLoginType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", InvalidLoginType, err, file, line)
}

func InvalidEmail(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", InvalidEmailType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", InvalidEmailType, err, file, line)
}

func InvalidPWD(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", InvalidPWDType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", InvalidPWDType, err, file, line)
}

func InvalidCount(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", InvalidCountType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", InvalidCountType, err, file, line)
}

func DiffPWD(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", DiffPWDType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", DiffPWDType, err, file, line)
}

func Hash(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", HashType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", HashType, err, file, line)
}

func NotFound(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", NotFoundType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", NotFoundType, err, file, line)
}

func JSON(err error) error {
	_, file, line, ok := runtime.Caller(1)
	if !ok {
		return fmt.Errorf("Error Type: %v, Error: %v, Place: %v", JSONType, err, "unknow")
	}
	return fmt.Errorf("Error Type: %v, Error: %v, Place: %v:%v", JSONType, err, file, line)
}
