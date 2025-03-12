# Stage 1: Build
FROM golang:latest

WORKDIR /backend

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o ./cmd/main ./cmd/main.go && chmod +x ./cmd/main

EXPOSE 8080

WORKDIR /backend/cmd

CMD ["./main"]