module Notifications
  module Builders
    class ChurchCreated < Base
      def recipients
        User.where(role: :lead_pastor, ministry_id: record.ministry_id)
      end

      def payload_for(_recipient)
        church = record
        {
          "church_id"     => church.id,
          "church_name"   => church.name,
          "city"          => church.city,
          "ministry_name" => church.ministry&.name,
          "target_url"    => "/lead-pastor/churches"
        }
      end
    end
  end
end
