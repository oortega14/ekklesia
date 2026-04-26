module Notifications
  module Builders
    class ServiceRequestCreated < Base
      def recipients
        User.where(role: :lead_pastor, ministry_id: record.ministry_id)
      end

      def payload_for(_recipient)
        request = record
        {
          "service_request_id" => request.id,
          "service_type"       => request.service_type,
          "requested_by_name"  => request.requested_by&.full_name,
          "church_name"        => request.church&.name,
          "requested_for"      => request.requested_for&.iso8601,
          "target_url"         => "/lead-pastor/services?request=#{request.id}"
        }
      end
    end
  end
end
