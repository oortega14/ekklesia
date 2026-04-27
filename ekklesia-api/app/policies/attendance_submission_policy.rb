class AttendanceSubmissionPolicy < ApplicationPolicy
  # Any authenticated user can see their own attendance submission view.
  # The controller scopes pending_services and recent_reports by role.
  def show? = user.present?
end
