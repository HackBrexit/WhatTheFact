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
  validates :paragraph, presence: true
  validates :fact_id, presence: true

  scope :title, -> (title) { where(title: /^#{title}/) }
  scope :paragraph, -> (paragraph) { where(paragraph: paragraph) }
  scope :fact_id, -> (isbn) { where(fact_id: fact_id) }

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
    facts = QuestionableFact.all

    [:title, :paragraph, :fact_id].each do |filter|
      facts = facts.send(filter, params[filter]) if params[filter]
    end

    facts.map { |fact| FactSerializer.new(fact) }.to_json
  end

  get '/facts/:id' do |id|
    fact = QuestionableFact.where(fact_id: id).first
    halt(404, { message: 'Fact Not Found'}.to_json) unless fact
    FactSerializer.new(fact).to_json
  end

  post '/facts' do
    fact = QuestionableFact.new(json_params)
    if fact.save
      response.headers['Location'] = "#{base_url}/api/v1/facts/#{fact.fact_id}"
      status 201
    else
      status 422
      body FactSerializer.new(fact).to_json
    end
  end

  helpers do
    def base_url
      @base_url ||= "#{request.env['rack.url_scheme']}://#{request.env['HTTP_HOST']}"
    end

    def json_params
      begin
        JSON.parse(request.body.read)
      rescue
        halt 400, { message: 'Invalid JSON' }.to_json
      end
    end
  end
end

#Serializers

class FactSerializer

  def initialize(fact)
    @fact = fact
  end

  def as_json(*)
    data = {
      fact_id: @fact.fact_id.to_s,
      title: @fact.title,
      paragraph: @fact.paragraph
    }
    data[:errors] = @fact.errors if @fact.errors.any?
    data
  end

end
