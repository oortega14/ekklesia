class ServicePolicy < ApplicationPolicy
  def index? = true
  def show?  = true

  def create?
    user.superadmin? || user.lead_pastor?
  end

  def update?
    user.superadmin? || user.lead_pastor?
  end

  def destroy?
    user.superadmin? || user.lead_pastor?
  end
end
