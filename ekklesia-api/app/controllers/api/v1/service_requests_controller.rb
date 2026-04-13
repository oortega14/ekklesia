module Api
  module V1
    class ServiceRequestsController < ApplicationController
      def index
        authorize ServiceRequest
        @requests = ServiceRequest.all.page(params[:page]).per(params[:per_page] || 20)
        render json: { service_requests: @requests }
      end

      def show
        @request = ServiceRequest.find(params[:id])
        authorize @request
        render json: { service_request: @request }
      end

      def create
        @request = ServiceRequest.new(service_request_params)
        @request.requested_by = current_user
        @request.church       = current_user.church unless current_user.superadmin?
        authorize @request
        if @request.save
          render json: { service_request: @request }, status: :created
        else
          render json: { errors: @request.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def approve
        @request = ServiceRequest.find(params[:id])
        authorize @request, :approve?
        @request.update!(status: :approved, reviewed_by: current_user)
        render json: { service_request: @request }
      end

      def reject
        @request = ServiceRequest.find(params[:id])
        authorize @request, :reject?
        @request.update!(status: :rejected, reviewed_by: current_user)
        render json: { service_request: @request }
      end

      private

      def service_request_params
        params.require(:service_request).permit(:service_type, :requested_for, :notes, :church_id)
      end
    end
  end
end
