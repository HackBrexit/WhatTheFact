class QuestionableFact
  include Mongoid::Document

  field :fact_id, type: String
  field :questionable_fact, type: String
  field :user_question, type: String
  field :questionable_fact_url, type: String
  field :user_email, type: String

  validates :questionable_fact, presence: true
  validates :user_question, presence: true
  validates :questionable_fact_url, presence: true
  validates :user_email, presence: true

  scope :questionable_fact, -> (questionable_fact) { where(questionable_fact: questionable_fact) }
  scope :fact_id, -> (isbn) { where(fact_id: fact_id) }

  index({ fact_id: 1 }, { unique: true, name: "fact_index" })
end
