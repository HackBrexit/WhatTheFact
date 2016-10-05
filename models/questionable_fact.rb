
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
