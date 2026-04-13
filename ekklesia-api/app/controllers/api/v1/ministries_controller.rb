module Api
  module V1
    class MinistriesController < ApplicationController
      def index
        authorize Ministry
        @ministries = Ministry.all.page(params[:page]).per(params[:per_page] || 20)
        render json: { ministries: @ministries, meta: pagination_meta(@ministries) }
      end

      def show
        @ministry = Ministry.find(params[:id])
        authorize @ministry
        render json: { ministry: @ministry }
      end

      def create
        @ministry = Ministry.new(ministry_params)
        authorize @ministry
        if @ministry.save
          render json: { ministry: @ministry }, status: :created
        else
          render json: { errors: @ministry.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        @ministry = Ministry.find(params[:id])
        authorize @ministry
        if @ministry.update(ministry_params)
          render json: { ministry: @ministry }
        else
          render json: { errors: @ministry.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @ministry = Ministry.find(params[:id])
        authorize @ministry
        @ministry.destroy
        render json: { message: 'Ministry deleted' }
      end

      private

      def ministry_params
        params.require(:ministry).permit(:name, :country, :city, :slug)
      end

      def pagination_meta(collection)
        {
          current_page: collection.current_page,
          total_pages:  collection.total_pages,
          total_count:  collection.total_count
        }
      end
    end
  end
end
