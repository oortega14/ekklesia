module Api
  module V1
    class ServicesOverviewController < ApplicationController
      PENDING_LIMIT  = 20
      MY_LIMIT       = 10
      RESOLVED_LIMIT = 10
      UPCOMING_LIMIT = 20

      def show
        authorize :services_overview, :show?

        render json: {
          pending_requests:  pending_requests.map  { |r| pending_payload(r) },
          my_requests:       my_requests.map       { |r| my_request_payload(r) },
          recent_resolved:   recent_resolved.map   { |r| resolved_payload(r) },
          upcoming_services: upcoming_services.map { |s| upcoming_payload(s) }
        }
      end

      private

      def pending_requests
        scope = ServiceRequest.includes(:requested_by, :church)
                              .where(status: :pending)
                              .order(requested_for: :asc)
                              .limit(PENDING_LIMIT)

        scope = scope.where(church_id: current_user.church_id) if current_user.pastor? || current_user.assistant?
        scope
      end

      def my_requests
        ServiceRequest.includes(:reviewed_by, :church)
                      .where(requested_by_id: current_user.id)
                      .order(requested_for: :desc)
                      .limit(MY_LIMIT)
      end

      def recent_resolved
        scope = ServiceRequest.includes(:requested_by, :reviewed_by, :church)
                              .where(status: %i[approved rejected])
                              .order(updated_at: :desc)
                              .limit(RESOLVED_LIMIT)

        scope = scope.where(church_id: current_user.church_id) if current_user.pastor? || current_user.assistant?
        scope
      end

      def upcoming_services
        scope = Service.includes(:church, :attendance_report)
                       .where("scheduled_at >= ?", Time.current.beginning_of_day)
                       .order(scheduled_at: :asc)
                       .limit(UPCOMING_LIMIT)

        scope = scope.where(church_id: current_user.church_id) if current_user.pastor? || current_user.assistant?
        scope
      end

      def pending_payload(req)
        {
          id:                req.id,
          service_type:      req.service_type,
          requested_for:     req.requested_for&.iso8601,
          requested_by_name: req.requested_by&.full_name,
          church_id:         req.church_id,
          church_name:       req.church&.name,
          notes:             req.notes
        }
      end

      def my_request_payload(req)
        {
          id:               req.id,
          service_type:     req.service_type,
          requested_for:    req.requested_for&.iso8601,
          status:           req.status,
          reviewed_by_name: req.reviewed_by&.full_name,
          reviewed_at:      req.status == "pending" ? nil : req.updated_at&.iso8601,
          church_name:      req.church&.name,
          notes:            req.notes
        }
      end

      def resolved_payload(req)
        {
          id:                req.id,
          service_type:      req.service_type,
          requested_for:     req.requested_for&.iso8601,
          status:            req.status,
          requested_by_name: req.requested_by&.full_name,
          reviewed_by_name:  req.reviewed_by&.full_name,
          reviewed_at:       req.updated_at&.iso8601,
          church_name:       req.church&.name
        }
      end

      def upcoming_payload(svc)
        {
          id:                    svc.id,
          service_type:          svc.service_type,
          scheduled_at:          svc.scheduled_at&.iso8601,
          church_id:             svc.church_id,
          church_name:           svc.church&.name,
          has_attendance_report: svc.attendance_report.present?
        }
      end
    end
  end
end
