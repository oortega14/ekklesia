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
          Notifications::Dispatcher.call(:service_request_created, @request, actor: current_user)
          render json: { service_request: @request }, status: :created
        else
          render json: { errors: @request.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def approve
        @request = ServiceRequest.find(params[:id])
        authorize @request, :approve?

        service = ActiveRecord::Base.transaction do
          @request.update!(status: :approved, reviewed_by: current_user)
          Service.create!(
            ministry:     @request.ministry,
            church:       @request.church,
            service_type: @request.service_type,
            scheduled_at: @request.requested_for,
            status:       :scheduled
          )
        end

        Notifications::Dispatcher.call(:service_request_approved, @request, actor: current_user)

        render json: {
          service_request: serialize_request(@request),
          service:         serialize_service(service)
        }
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      def reject
        @request = ServiceRequest.find(params[:id])
        authorize @request, :reject?
        @request.update!(status: :rejected, reviewed_by: current_user)
        Notifications::Dispatcher.call(:service_request_rejected, @request, actor: current_user)
        render json: { service_request: @request }
      end

      private

      def service_request_params
        params.require(:service_request).permit(:service_type, :requested_for, :notes, :church_id)
      end

      def serialize_request(req)
        {
          id:                req.id,
          service_type:      req.service_type,
          requested_for:     req.requested_for&.iso8601,
          status:            req.status,
          requested_by_name: req.requested_by&.full_name,
          reviewed_by_name:  req.reviewed_by&.full_name,
          church_id:         req.church_id,
          church_name:       req.church&.name,
          notes:             req.notes
        }
      end

      def serialize_service(svc)
        {
          id:           svc.id,
          service_type: svc.service_type,
          scheduled_at: svc.scheduled_at&.iso8601,
          church_id:    svc.church_id,
          status:       svc.status
        }
      end
    end
  end
end
