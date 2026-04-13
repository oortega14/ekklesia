class Donation < Contribution
  def self.policy_class = ContributionPolicy
end
