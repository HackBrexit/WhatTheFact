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
