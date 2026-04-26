module Notifications
  module Builders
    class Base
      attr_reader :record, :actor

      def initialize(record, actor)
        @record = record
        @actor  = actor
      end

      # Returns an Array<User> who should receive this notification.
      # Subclasses override.
      def recipients
        raise NotImplementedError
      end

      # Returns a Hash payload for the given recipient. Subclasses override.
      # The payload MUST include a "target_url" string.
      def payload_for(_recipient)
        raise NotImplementedError
      end
    end
  end
end
