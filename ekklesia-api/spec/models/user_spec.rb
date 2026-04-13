require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name) }
    it { should validate_presence_of(:role) }
  end

  describe 'associations' do
    it { should belong_to(:account) }
    it { should belong_to(:ministry).optional }
    it { should belong_to(:church).optional }
  end

  describe '#full_name' do
    it 'returns first and last name joined' do
      user = build(:user, first_name: 'Carlos', last_name: 'Mendez')
      expect(user.full_name).to eq('Carlos Mendez')
    end
  end

  describe 'roles' do
    it 'superadmin has no ministry_id' do
      user = build(:user, :superadmin, ministry: nil)
      expect(user.superadmin?).to be true
      expect(user.ministry_id).to be_nil
    end
  end
end
