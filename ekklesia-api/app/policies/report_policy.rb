class ReportPolicy < ApplicationPolicy
  # Any authenticated user can request reports — controller scopes the
  # data based on role (acts_as_tenant + manual church filter for
  # pastor/assistant). Mirrors StatsPolicy.
  def attendance?    = user.present?
  def contributions? = user.present?
end
