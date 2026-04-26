module Api
  module V1
    class AttendanceReportsController < ApplicationController
      def index
        authorize AttendanceReport
        @reports = scoped_reports.page(params[:page]).per(params[:per_page] || 20)
        render json: { attendance_reports: @reports }
      end

      def show
        @report = AttendanceReport.find(params[:id])
        authorize @report
        render json: { attendance_report: @report }
      end

      def create
        @report = AttendanceReport.new(report_params)
        @report.reported_by = current_user
        authorize @report
        if @report.save
          Notifications::Dispatcher.call(:attendance_report_submitted, @report, actor: current_user)
          render json: { attendance_report: @report }, status: :created
        else
          render json: { errors: @report.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        @report = AttendanceReport.find(params[:id])
        authorize @report
        if @report.update(report_params)
          render json: { attendance_report: @report }
        else
          render json: { errors: @report.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def scoped_reports
        if current_user.superadmin? || current_user.lead_pastor?
          AttendanceReport.all
        elsif current_user.pastor?
          AttendanceReport.joins(:service).where(services: { church_id: current_user.church_id })
        else
          AttendanceReport.where(reported_by: current_user)
        end
      end

      def report_params
        params.require(:attendance_report).permit(:service_id, :adults, :youth, :children, :notes)
      end
    end
  end
end
