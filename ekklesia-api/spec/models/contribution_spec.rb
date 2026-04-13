require 'rails_helper'

RSpec.describe Contribution, type: :model do
  describe 'STI types' do
    it 'Tithe is a Contribution' do
      expect(Tithe.ancestors).to include(Contribution)
    end

    it 'Offering is a Contribution' do
      expect(Offering.ancestors).to include(Contribution)
    end

    it 'stores correct type discriminator' do
      ministry = create(:ministry)
      church   = create(:church, ministry: ministry)
      service  = create(:service, ministry: ministry, church: church)
      user     = create(:user, ministry: ministry)

      ActsAsTenant.with_tenant(ministry) do
        tithe = Tithe.create!(
          ministry:     ministry,
          service:      service,
          reported_by:  user,
          amount:       1000.00,
          submitted_at: Time.current
        )
        expect(tithe.type).to eq('Tithe')
        expect(Contribution.find(tithe.id)).to be_a(Tithe)
      end
    end
  end

  describe 'validations' do
    it { should validate_presence_of(:amount) }
  end
end
