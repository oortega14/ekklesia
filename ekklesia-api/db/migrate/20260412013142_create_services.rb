class CreateServices < ActiveRecord::Migration[8.0]
  def change
    create_table :services do |t|
      t.references :ministry, null: false, foreign_key: true
      t.references :church,   null: false, foreign_key: true
      t.string   :service_type, null: false
      t.datetime :scheduled_at, null: false
      t.integer  :status, null: false, default: 0  # 0=scheduled,1=completed,2=cancelled
      t.timestamps
    end
  end
end
