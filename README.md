# What the Fact  API

## Quick Start

1. `bundle install`
2. `mongod` to start the mongo server
3. `bundle exec ruby server`


# API endpoints

### Get facts list

#### Request 

[GET] `/api/v1/facts`

#### Response

```
[
  {
    "fact_id": "1",
    "title": "example 1",
    "paragraph": "minister under the influence is a hackbrixit project"
  },
  {
    "fact_id": "2",
    "title": "Minister under the influence",
    "paragraph": "Minister under the influence is a hack brixit app"
  }
]
```

### Post Fact

In the command line
`curl -i -X POST -H "Content-Type: application/json" -d '{"title":"Minister under the influence", "paragraph":"Minister under the influence is a hack brixit app", "fact_id":"0123456789"}' http://localhost:4567/api/v1/facts`

#### Response

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: http://localhost:4567/api/v1/books/5710b7b6fef9afa7a8e5db81
...
```
