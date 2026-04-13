class ChurchPolicy < ApplicationPolicy
  def index?
    user.superadmin? || user.lead_pastor?
  end

  def show?
    user.superadmin? ||
      user.lead_pastor? ||
      (user.pastor? && record.id == user.church_id)
  end

  def create?
    user.superadmin? || user.lead_pastor?
  end

  def update?
    user.superadmin? || user.lead_pastor?
  end

  def destroy?
    user.superadmin?
  end
end
