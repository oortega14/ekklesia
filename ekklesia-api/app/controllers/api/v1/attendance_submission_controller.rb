module Api
  module V1
    class AttendanceSubmissionController < ApplicationController
      MAX_PENDING = 10
      MAX_RECENT  = 10

      def show
        authorize :attendance_submission, :show?

        render json: {
          pending_services: pending_services.map { |s| pending_payload(s) },
          recent_reports:   recent_reports.map  { |r| recent_payload(r) }
        }
      end

      private

      # Past services (or scheduled today) within the user's scope that have
      # no AttendanceReport. Tenant scoping (acts_as_tenant) handles the
      # ministry filter for lead_pastor automatically; pastor/assistant get
      # an explicit church_id filter on top.
      def pending_services
        scope = Service.includes(:church)
                       .where("scheduled_at < ?", Time.current.end_of_day)
                       .left_joins(:attendance_report)
                       .where(attendance_reports: { id: nil })
                       .order(scheduled_at: :desc)
                       .limit(MAX_PENDING)

        scope = scope.where(church_id: current_user.church_id) if current_user.pastor? || current_user.assistant?
        scope
      end

      def recent_reports
        AttendanceReport.includes(service: :church)
                        .where(reported_by_id: current_user.id)
                        .order(submitted_at: :desc)
                        .limit(MAX_RECENT)
      end

      def pending_payload(service)
        {
          id:           service.id,
          service_type: service.service_type,
          scheduled_at: service.scheduled_at&.iso8601,
          church_id:    service.church_id,
          church_name:  service.church&.name
        }
      end

      def recent_payload(report)
        service = report.service
        {
          id:           report.id,
          service_id:   service.id,
          service_type: service.service_type,
          service_date: service.scheduled_at&.iso8601,
          church_name:  service.church&.name,
          adults:       report.adults,
          youth:        report.youth,
          children:     report.children,
          total:        report.total,
          notes:        report.notes,
          submitted_at: report.submitted_at&.iso8601
        }
      end
    end
  end
end
