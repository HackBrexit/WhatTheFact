class FactSerializer

  def initialize(fact)
    @fact = fact
  end

  def as_json(*)
    data = {
      fact_id: @fact.fact_id.to_s,
      user_question: @fact.user_question,
      questionable_fact: @fact.questionable_fact,
      questionable_fact_url: @fact.questionable_fact_url,
      user_email: @fact.user_email
    }
    data[:errors] = @fact.errors if @fact.errors.any?
    data
  end

end
