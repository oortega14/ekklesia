module Api
  module V1
    class NotificationsController < ApplicationController
      def index
        scope = current_user.notifications
        scope = scope.unread                       if params[:unread] == "true"
        scope = scope.where(kind: params[:kind])   if params[:kind].present?
        @notifications = scope.order(created_at: :desc)
                              .page(params[:page]).per(params[:per_page] || 20)
        render json: {
          notifications: @notifications.map { |n| serialize(n) },
          meta:          pagination_meta(@notifications),
          unread_count:  current_user.notifications.unread.count
        }
      end

      def read
        @notification = current_user.notifications.find(params[:id])
        @notification.read!
        render json: { notification: serialize(@notification) }
      end

      def read_all
        current_user.notifications.unread.update_all(read_at: Time.current)
        render json: { unread_count: 0 }
      end

      def destroy
        current_user.notifications.find(params[:id]).destroy
        render json: { message: "Notification deleted" }
      end

      private

      def serialize(n)
        {
          id:         n.id,
          kind:       n.kind,
          payload:    n.payload,
          read_at:    n.read_at&.iso8601,
          created_at: n.created_at.iso8601
        }
      end

      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          total_pages:  collection.total_pages,
          total_count:  collection.total_count
        }
      end
    end
  end
end
