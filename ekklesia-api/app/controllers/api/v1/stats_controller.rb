module Api
  module V1
    class StatsController < ApplicationController
      def show
        authorize :stats, :show?
        result = stats_for_current_user
        render json: result if result
      end

      private

      def stats_for_current_user
        case current_user.role.to_sym
        when :superadmin  then superadmin_stats
        when :lead_pastor then lead_pastor_stats
        when :pastor      then pastor_stats
        when :assistant   then assistant_stats
        else
          render json: { error: "No stats defined for role: #{current_user.role}" }, status: :unprocessable_entity
          nil
        end
      end

      # tenant is nil for superadmin → sees all records
      def superadmin_stats
        {
          total_churches:             Church.count,
          total_users:                User.where.not(role: :superadmin).count,
          services_this_month:        Service.where(scheduled_at: Time.current.all_month).count,
          total_contributions_amount: Contribution.sum(:amount).to_f,
          total_attendance:           AttendanceReport.sum(:total)
        }
      end

      # tenant = ministry → auto-scoped by acts_as_tenant
      def lead_pastor_stats
        {
          churches_count:      Church.count,
          # User is not tenant-scoped via acts_as_tenant; filter by ministry_id manually.
          pastors_count:       User.where(role: :pastor, ministry_id: current_user.ministry_id).count,
          services_this_month: Service.where(scheduled_at: Time.current.all_month).count,
          total_attendance:    AttendanceReport.sum(:total),
          total_contributions: Contribution.sum(:amount).to_f
        }
      end

      def pastor_stats
        church_id = current_user.church_id
        total_services = Service.where(church_id: church_id).count
        pending_attendance = Service.where(church_id: church_id)
                                    .left_joins(:attendance_report)
                                    .where(attendance_reports: { id: nil })
                                    .count
        services_with_contributions = Service.where(church_id: church_id)
                                             .joins(:contributions)
                                             .distinct
                                             .count
        {
          services_count:             total_services,
          pending_attendance_reports: pending_attendance,
          pending_contributions:      total_services - services_with_contributions,
          # User is not tenant-scoped via acts_as_tenant; filter by church_id manually.
          assistants_count:           User.where(church_id: church_id, role: :assistant).count
        }
      end

      def assistant_stats
        {
          pending_service_requests: ServiceRequest.where(
                                      church_id: current_user.church_id,
                                      status:    :pending
                                    ).count,
          submitted_reports_count:  AttendanceReport.where(reported_by_id: current_user.id).count
        }
      end
    end
  end
end
