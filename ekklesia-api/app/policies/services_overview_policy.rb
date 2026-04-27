class ServicesOverviewPolicy < ApplicationPolicy
  # Any authenticated user can see their own overview. Controller scopes
  # the four arrays by role.
  def show? = user.present?
end
