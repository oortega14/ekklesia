module Api
  module V1
    class ServicesController < ApplicationController
      def index
        authorize Service
        @services = scoped_services
                      .includes(:attendance_report, :contributions)
                      .page(params[:page])
                      .per(params[:per_page] || 20)
        render json: { services: @services.map { |s| service_payload(s) } }
      end

      def show
        @service = Service.find(params[:id])
        authorize @service
        render json: { service: @service }
      end

      def create
        @service = Service.new(service_params)
        authorize @service
        if @service.save
          render json: { service: @service }, status: :created
        else
          render json: { errors: @service.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        @service = Service.find(params[:id])
        authorize @service
        if @service.update(service_params)
          render json: { service: @service }
        else
          render json: { errors: @service.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @service = Service.find(params[:id])
        authorize @service
        @service.destroy
        render json: { message: 'Service deleted' }
      end

      private

      def service_payload(service)
        service.as_json.merge(
          'has_attendance_report' => service.attendance_report.present?,
          'has_contributions'     => service.contributions.any?
        )
      end

      def scoped_services
        if current_user.superadmin? || current_user.lead_pastor?
          Service.all
        else
          Service.where(church_id: current_user.church_id)
        end
      end

      def service_params
        params.require(:service).permit(:church_id, :service_type, :scheduled_at, :status)
      end
    end
  end
end
