module Notifications
  module Builders
    class ServiceRequestRejected < Base
      def recipients
        [ record.requested_by ].compact
      end

      def payload_for(_recipient)
        request = record
        {
          "service_request_id" => request.id,
          "service_type"       => request.service_type,
          "reviewed_by_name"   => request.reviewed_by&.full_name,
          "church_name"        => request.church&.name,
          "requested_for"      => request.requested_for&.iso8601,
          "target_url"         => "/pastor/services"
        }
      end
    end
  end
end
