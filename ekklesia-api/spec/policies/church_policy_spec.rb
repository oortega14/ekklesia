require 'rails_helper'

RSpec.describe ChurchPolicy, type: :policy do
  let(:ministry) { create(:ministry) }

  def policy(user, record)
    described_class.new(user, record)
  end

  context 'superadmin' do
    let(:user) { create(:user, :superadmin) }

    it 'can index' do
      expect(policy(user, Church).index?).to be true
    end

    it 'can create' do
      expect(policy(user, Church).create?).to be true
    end
  end

  context 'lead_pastor' do
    let(:user)   { create(:user, :lead_pastor, ministry: ministry) }
    let(:church) { create(:church, ministry: ministry) }

    it 'can index'  do
      expect(policy(user, Church).index?).to be true
    end

    it 'can create' do
      expect(policy(user, Church).create?).to be true
    end

    it 'can show' do
      expect(policy(user, church).show?).to be true
    end
  end

  context 'pastor' do
    let(:church) { create(:church, ministry: ministry) }
    let(:user)   { create(:user, :pastor, ministry: ministry, church: church) }

    it 'cannot create' do
      expect(policy(user, Church).create?).to be false
    end

    it 'can show own church' do
      expect(policy(user, church).show?).to be true
    end
  end

  context 'assistant' do
    let(:church) { create(:church, ministry: ministry) }
    let(:user)   { create(:user, :assistant, ministry: ministry, church: church) }

    it 'cannot index' do
      expect(policy(user, Church).index?).to be false
    end

    it 'cannot create' do
      expect(policy(user, Church).create?).to be false
    end
  end
end
