module Notifications
  module Builders
    class MinistryCreated < Base
      def recipients
        User.where(role: :superadmin)
      end

      def payload_for(_recipient)
        {
          "ministry_id"      => record.id,
          "ministry_name"    => record.name,
          "lead_pastor_name" => lead_pastor_name,
          "target_url"       => "/superadmin/ministries"
        }
      end

      private

      # Memoized: payload_for is called once per recipient (all superadmins).
      # The lead pastor for a given ministry doesn't change between
      # recipients, so we look it up once.
      def lead_pastor_name
        return @lead_pastor_name if defined?(@lead_pastor_name)

        @lead_pastor_name = User.find_by(role: :lead_pastor, ministry_id: record.id)&.full_name
      end
    end
  end
end
