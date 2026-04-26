class NotificationPolicy < ApplicationPolicy
  # Authorization is handled by scoping queries to current_user.notifications
  # in the controller. No explicit policy methods needed beyond the
  # require-authentication that ApplicationController#authenticate! enforces.
end
