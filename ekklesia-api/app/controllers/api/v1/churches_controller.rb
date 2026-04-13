module Api
  module V1
    class ChurchesController < ApplicationController
      def index
        authorize Church
        @churches = Church.all.page(params[:page]).per(params[:per_page] || 20)
        render json: { churches: @churches }
      end

      def show
        @church = Church.find(params[:id])
        authorize @church
        render json: { church: @church }
      end

      def create
        @church = Church.new(church_params)
        @church.ministry = current_user.ministry unless current_user.superadmin?
        authorize @church
        if @church.save
          render json: { church: @church }, status: :created
        else
          render json: { errors: @church.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        @church = Church.find(params[:id])
        authorize @church
        if @church.update(church_params)
          render json: { church: @church }
        else
          render json: { errors: @church.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @church = Church.find(params[:id])
        authorize @church
        @church.destroy
        render json: { message: 'Church deleted' }
      end

      private

      def church_params
        params.require(:church).permit(:name, :address, :city, :status, :ministry_id, :email, :phone)
      end
    end
  end
end
