require "csv"

module Api
  module V1
    class ReportsController < ApplicationController
      MAX_JSON_ROWS = 1000

      ATTENDANCE_HEADERS = [
        "Servicio", "Tipo de servicio", "Iglesia", "Fecha",
        "Adultos", "Jóvenes", "Niños", "Total",
        "Reportado por", "Reportado el"
      ].freeze

      def attendance
        authorize :report, :attendance?
        scope = build_attendance_scope

        if csv_format?
          send_data attendance_csv(scope),
                    type:     "text/csv; charset=utf-8",
                    filename: "asistencia-#{period_filename}.csv"
        else
          rows = scope.limit(MAX_JSON_ROWS + 1).to_a
          truncated = rows.length > MAX_JSON_ROWS
          rows = rows.first(MAX_JSON_ROWS)
          render json: {
            rows:      rows.map { |r| attendance_row(r) },
            summary:   attendance_summary(scope),
            truncated: truncated
          }
        end
      end

      private

      def build_attendance_scope
        scope = AttendanceReport
                  .includes(:reported_by, service: :church)
                  .where(submitted_at: period_range)

        if (cid = effective_church_id)
          scope = scope.joins(:service).where(services: { church_id: cid })
        end
        if params[:service_type].present?
          scope = scope.joins(:service)
                       .where(services: { service_type: params[:service_type] })
        end

        scope.order(submitted_at: :desc)
      end

      def attendance_row(report)
        service = report.service
        {
          id:               report.id,
          service_id:       service.id,
          service_type:     service.service_type,
          scheduled_at:     service.scheduled_at&.iso8601,
          church_id:        service.church_id,
          church_name:      service.church&.name,
          adults:           report.adults,
          youth:            report.youth,
          children:         report.children,
          total:            report.total,
          reported_by_name: report.reported_by&.full_name,
          submitted_at:     report.submitted_at&.iso8601
        }
      end

      def attendance_summary(scope)
        count = scope.count
        total = scope.sum(:total)
        avg   = count.positive? ? (total.to_f / count).round : 0
        {
          total_count:         count,
          total_attendance:    total.to_i,
          average_per_service: avg,
          period_label:        period_label
        }
      end

      def attendance_csv(scope)
        CSV.generate(headers: false) do |csv|
          csv << ATTENDANCE_HEADERS
          scope.find_each do |r|
            service = r.service
            csv << [
              service.id,
              service.service_type,
              service.church&.name,
              service.scheduled_at&.iso8601,
              r.adults,
              r.youth,
              r.children,
              r.total,
              r.reported_by&.full_name,
              r.submitted_at&.iso8601
            ]
          end
        end
      end

      # ── Shared helpers (also used by contributions in Task 5) ────────

      def csv_format?
        params[:format].to_s.downcase == "csv"
      end

      # period query param → Range covering this calendar period.
      # NOTE: assumes app and DB both run in UTC. If config.time_zone
      # ever changes, audit boundaries here and in DATE_TRUNC queries.
      def period_range
        case params[:period]
        when "this_quarter" then Time.current.all_quarter
        when "this_year"    then Time.current.all_year
        else                     Time.current.all_month
        end
      end

      def period_label
        case params[:period]
        when "this_quarter" then "Q#{((Time.current.month - 1) / 3) + 1} #{Time.current.year}"
        when "this_year"    then Time.current.year.to_s
        else                     I18n.l(Time.current, format: "%B %Y").capitalize
        end
      end

      def period_filename
        case params[:period]
        when "this_quarter" then "#{Time.current.year}-Q#{((Time.current.month - 1) / 3) + 1}"
        when "this_year"    then Time.current.year.to_s
        else                     Time.current.strftime("%Y-%m")
        end
      end

      def effective_church_id
        if current_user.pastor? || current_user.assistant?
          return current_user.church_id
        end

        cid = params[:church_id].presence&.to_i
        return nil unless cid

        return cid if current_user.superadmin?

        # lead_pastor: tenant scoping auto-filters by ministry. If the
        # requested church belongs to another ministry, .exists? returns
        # false and we ignore the param.
        Church.where(id: cid).exists? ? cid : nil
      end
    end
  end
end
