module Notifications
  module Builders
    class MinistryCreated < Base
      def recipients
        User.where(role: :superadmin)
      end

      def payload_for(_recipient)
        ministry = record
        lead_pastor = User.find_by(role: :lead_pastor, ministry_id: ministry.id)
        {
          "ministry_id"      => ministry.id,
          "ministry_name"    => ministry.name,
          "lead_pastor_name" => lead_pastor&.full_name,
          "target_url"       => "/superadmin/ministries"
        }
      end
    end
  end
end
