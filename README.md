# CQRS Toy

A toy project to test CQRS principle.

## Usage

Install docker and docker-compose


```javascript
docker-compose up
```

This command will build, pull and run the project

```
renormalizer_1  | ** 163.764268 / 880.741371 ms 1
```

## Architecture

This project use 5 services:
 - database: mongo db
 - service bus: rabbitmq
 - message generator
 - event storer
 - database remornalizer


