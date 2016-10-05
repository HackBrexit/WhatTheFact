# server.rb
require 'sinatra'
require 'mongoid'
require 'sinatra/namespace'
require_relative 'models/questionable_fact'
require_relative 'routes/routes'
require_relative 'serializer/fact_serializer'

# DB Setup
Mongoid.load! "mongoid.config"
