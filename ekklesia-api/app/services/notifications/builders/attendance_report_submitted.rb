module Notifications
  module Builders
    class AttendanceReportSubmitted < Base
      def recipients
        leads   = User.where(role: :lead_pastor, ministry_id: record.ministry_id).to_a
        pastors = if actor&.assistant?
                    User.where(role: :pastor, church_id: record.service.church_id).to_a
        else
                    []
        end
        (leads + pastors).uniq
      end

      def payload_for(recipient)
        report  = record
        service = report.service
        {
          "attendance_report_id" => report.id,
          "service_id"           => service.id,
          "reported_by_name"     => report.reported_by&.full_name,
          "church_name"          => service.church&.name,
          "service_type"         => service.service_type,
          "service_date"         => service.scheduled_at&.iso8601,
          "total"                => report.total,
          "target_url"           => target_url_for(recipient)
        }
      end

      private

      def target_url_for(recipient)
        recipient.lead_pastor? ? "/lead-pastor/reports" : "/pastor/reports"
      end
    end
  end
end
