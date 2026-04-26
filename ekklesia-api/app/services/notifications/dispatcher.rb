module Notifications
  class Dispatcher
    BUILDERS = {
      ministry_created:            "Notifications::Builders::MinistryCreated",
      service_request_created:     "Notifications::Builders::ServiceRequestCreated",
      service_request_approved:    "Notifications::Builders::ServiceRequestApproved",
      service_request_rejected:    "Notifications::Builders::ServiceRequestRejected",
      attendance_report_submitted: "Notifications::Builders::AttendanceReportSubmitted",
      contribution_recorded:       "Notifications::Builders::ContributionRecorded",
      user_created:                "Notifications::Builders::UserCreated",
      church_created:              "Notifications::Builders::ChurchCreated"
    }.freeze

    # Public entry point. Call AFTER the source record has been persisted
    # and AFTER any wrapping transaction has committed.
    #
    #   Notifications::Dispatcher.call(:service_request_created, request, actor: current_user)
    def self.call(kind, record, actor:)
      raise ArgumentError, "actor is required" if actor.nil?

      builder_class = BUILDERS[kind] or raise ArgumentError, "Unknown notification kind: #{kind}"
      builder = builder_class.constantize.new(record, actor)

      dispatches = builder.recipients
                          .reject { |r| r.id == actor.id }
                          .map { |r| { recipient_id: r.id, payload: builder.payload_for(r) } }

      return if dispatches.empty?

      NotifyJob.perform_later(kind: kind.to_s, dispatches: dispatches)
    end
  end
end
