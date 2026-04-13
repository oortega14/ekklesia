class ServiceRequestPolicy < ApplicationPolicy
  def index?
    !user.assistant?
  end

  def show?
    !user.assistant?
  end

  def create?
    user.superadmin? || user.lead_pastor? || user.pastor?
  end

  def approve?
    user.superadmin? || user.lead_pastor?
  end

  def reject?
    user.superadmin? || user.lead_pastor?
  end
end
