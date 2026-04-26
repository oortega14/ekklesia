module Notifications
  module Builders
    class UserCreated < Base
      def recipients
        new_user = record
        result   = []

        if new_user.lead_pastor? || new_user.pastor?
          result.concat(User.where(role: :lead_pastor, ministry_id: new_user.ministry_id).to_a)
        elsif new_user.assistant?
          result.concat(User.where(role: :pastor, church_id: new_user.church_id).to_a)
          result.concat(User.where(role: :lead_pastor, ministry_id: new_user.ministry_id).to_a)
        end

        result.uniq
      end

      def payload_for(recipient)
        new_user = record
        {
          "user_id"         => new_user.id,
          "user_name"       => new_user.full_name,
          "user_role"       => new_user.role,
          "user_role_label" => Notifications::USER_ROLE_LABELS.fetch(new_user.role, new_user.role),
          "church_name"     => new_user.church&.name,
          "ministry_name"   => new_user.ministry&.name,
          "target_url"      => target_url_for(recipient)
        }
      end

      private

      def target_url_for(recipient)
        recipient.lead_pastor? ? "/lead-pastor/pastors" : "/pastor/assistants"
      end
    end
  end
end
