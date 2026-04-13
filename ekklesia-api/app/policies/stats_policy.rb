class StatsPolicy < ApplicationPolicy
  # Any authenticated user can fetch their own stats.
  # The controller branches on role.
  def show?
    true
  end
end
