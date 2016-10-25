# What the Fact  API

## Quick Start

Make sure you have [vagrant](https://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/) (or other supported provider) installed
If you experience any problems try updating them first.

1. `vagrant up`
2. `vagrant ssh`
3. `cd /vagrant`
4. `bundle install`
5. `bundler exec ruby server.rb -o 0.0.0.0`
6. Go to http://127.0.0.1:4567/ you should see `Welcome to What the fact!`

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
`curl -i -X POST -H "Content-Type: application/json" \
-d '{"user_question":"Minister under the influence", "questionable_fact":"Minister under the influence is a hack brexit app", "questionable_fact_url": "http://hackbrexit.org/", "user_email": "your.email@hackbrexit.org"}' \
 http://localhost:4567/api/v1/facts`

#### Response

```
HTTP/1.1 201 Created
Content-Type: application/json
Location: http://localhost:4567/api/v1/books/5710b7b6fef9afa7a8e5db81
...
```
