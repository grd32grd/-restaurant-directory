terraform {
  required_providers {
    heroku = {
      source  = "heroku/heroku"
      version = "~> 4.8"
    }
  }
}

variable "example_app_name" {
  description = "this is the name of the heroku app"
}

resource "heroku_app" "example" {
  name   = var.example_app_name
  region = "us"
}
