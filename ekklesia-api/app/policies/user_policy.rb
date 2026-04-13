class UserPolicy < ApplicationPolicy
  def index?
    user.superadmin? || user.lead_pastor? || user.pastor?
  end

  def show?
    user.superadmin? ||
      user.lead_pastor? ||
      user.pastor? ||
      record.id == user.id
  end

  def create?
    return true if user.superadmin? || user.lead_pastor?
    # Pastor can create assistants for their own church
    user.pastor? && record.is_a?(User) && !record.persisted? && record.assistant?
  end

  def update?
    user.superadmin? || record.id == user.id
  end

  def destroy?
    user.superadmin?
  end
end
