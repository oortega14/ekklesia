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

      # POST /api/v1/ministries
      #
      # Two payload shapes:
      #   { ministry: {...} }                          → create only the ministry
      #   { ministry: {...}, lead_pastor: {...} }      → create ministry + Account + lead_pastor User atomically
      def create
        authorize Ministry.new(ministry_params)

        ministry = nil
        lead_pastor = nil

        ActiveRecord::Base.transaction do
          ministry = Ministry.create!(ministry_params)
          lead_pastor = create_lead_pastor!(ministry) if lead_pastor_params.present?
        end

        Notifications::Dispatcher.call(:ministry_created, ministry, actor: current_user)

        render json: ministry_response(ministry, lead_pastor), status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      rescue ActiveRecord::RecordNotUnique
        render json: { errors: [ "Email is already taken" ] }, status: :unprocessable_entity
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
        render json: { message: "Ministry deleted" }
      end

      private

      def ministry_params
        params.require(:ministry).permit(:name, :country, :city, :slug)
      end

      def lead_pastor_params
        return {} unless params[:lead_pastor].present?

        params.require(:lead_pastor).permit(:email, :password, :first_name, :last_name, :phone)
      end

      def create_lead_pastor!(ministry)
        attrs = lead_pastor_params
        account = Account.create!(
          email:         attrs[:email],
          password_hash: BCrypt::Password.create(attrs[:password].to_s),
          jwt_secret:    SecureRandom.hex(32),
          status:        :verified
        )
        User.create!(
          account:    account,
          ministry:   ministry,
          first_name: attrs[:first_name],
          last_name:  attrs[:last_name],
          phone:      attrs[:phone],
          role:       :lead_pastor
        )
      end

      def ministry_response(ministry, lead_pastor)
        body = { ministry: ministry }
        if lead_pastor
          body[:lead_pastor] = {
            id:         lead_pastor.id,
            email:      lead_pastor.account.email,
            full_name:  lead_pastor.full_name,
            role:       lead_pastor.role
          }
        end
        body
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
