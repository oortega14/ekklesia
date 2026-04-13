class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.references :account,   null: false, foreign_key: true, index: { unique: true }
      t.references :ministry,  null: true,  foreign_key: true
      t.references :church,    null: true,  foreign_key: false
      t.string     :first_name, null: false
      t.string     :last_name,  null: false
      t.string     :phone
      t.integer    :role,       null: false, default: 3  # 0=superadmin,1=lead_pastor,2=pastor,3=assistant
      t.timestamps
    end
  end
end
