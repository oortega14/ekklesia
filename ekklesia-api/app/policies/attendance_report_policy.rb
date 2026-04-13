class AttendanceReportPolicy < ApplicationPolicy
  def index? = true
  def show?  = true

  def create?
    return true if user.superadmin? || user.lead_pastor? || user.pastor?
    # Assistant can only report for their own church
    user.assistant? && record.is_a?(AttendanceReport) &&
      record.service&.church_id == user.church_id
  end

  def update?
    user.superadmin? || user.lead_pastor?
  end
end
