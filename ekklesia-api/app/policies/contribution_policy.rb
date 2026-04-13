class ContributionPolicy < ApplicationPolicy
  def index? = true
  def show?  = true

  def create?
    return true if user.superadmin? || user.lead_pastor? || user.pastor?
    user.assistant? && record.is_a?(Contribution) &&
      record.service&.church_id == user.church_id
  end

  def update?
    user.superadmin? || user.lead_pastor?
  end
end
