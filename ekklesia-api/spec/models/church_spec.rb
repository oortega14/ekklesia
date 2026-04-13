require 'rails_helper'

RSpec.describe Church, type: :model do
  describe 'associations' do
    it { should belong_to(:ministry) }
    it { should have_many(:services).dependent(:destroy) }
    it { should have_many(:users) }
  end

  describe 'validations' do
    it { should validate_presence_of(:name) }
  end

  describe 'tenant scoping' do
    it 'belongs to a ministry as tenant' do
      ministry = create(:ministry)
      ActsAsTenant.with_tenant(ministry) do
        church = create(:church, ministry: ministry)
        expect(Church.all).to include(church)
      end
    end
  end
end
