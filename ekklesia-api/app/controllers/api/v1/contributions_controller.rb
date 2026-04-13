module Api
  module V1
    class ContributionsController < ApplicationController
      VALID_TYPES = %w[Tithe Offering Donation Firstfruit Covenant].freeze

      def index
        authorize Contribution
        @contributions = scoped_contributions.page(params[:page]).per(params[:per_page] || 20)
        render json: { contributions: @contributions }
      end

      def show
        @contribution = Contribution.find(params[:id])
        authorize @contribution
        render json: { contribution: @contribution }
      end

      def create
        type_name = params.dig(:contribution, :type)
        unless VALID_TYPES.include?(type_name)
          return render json: { error: "Invalid contribution type: #{type_name}" },
                        status: :unprocessable_entity
        end

        @contribution = type_name.constantize.new(contribution_params.except(:type))
        @contribution.reported_by = current_user
        authorize @contribution

        if @contribution.save
          render json: { contribution: @contribution.as_json.merge('type' => @contribution.type) }, status: :created
        else
          render json: { errors: @contribution.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        @contribution = Contribution.find(params[:id])
        authorize @contribution
        if @contribution.update(contribution_params.except(:type))
          render json: { contribution: @contribution }
        else
          render json: { errors: @contribution.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def scoped_contributions
        if current_user.superadmin? || current_user.lead_pastor?
          Contribution.all
        else
          Contribution.joins(:service).where(services: { church_id: current_user.church_id })
        end
      end

      def contribution_params
        params.require(:contribution).permit(:type, :service_id, :amount, :currency, :notes)
      end
    end
  end
end
