# server.rb
require 'sinatra'
require 'mongoid'
require "sinatra/namespace"

# DB Setup
Mongoid.load! "mongoid.config"

# Models
class QuestionableFact
  include Mongoid::Document

  field :title, type: String
  field :paragraph, type: String
  field :fact_id, type: String

  validates :title, presence: true
  validates :author, presence: true
  validates :fact_id, presence: true

  index({ title: 'text' })
  index({ fact_id: 1 }, { unique: true, name: "fact_index" })
end

#Routes
get '/' do
  'Welcome to What the fact!'
end

namespace '/api/v1' do
  before do
    content_type 'application/json'
  end

  get '/facts' do
    QuestionableFact.all.to_json
  end
end
