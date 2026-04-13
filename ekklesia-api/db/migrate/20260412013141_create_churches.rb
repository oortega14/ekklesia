class CreateChurches < ActiveRecord::Migration[8.0]
  def change
    create_table :churches do |t|
      t.references :ministry, null: false, foreign_key: true
      t.string  :name,    null: false
      t.string  :address
      t.string  :city
      t.integer :status, null: false, default: 0  # 0=active, 1=pending, 2=inactive
      t.timestamps
    end
    add_foreign_key :users, :churches, column: :church_id
  end
end
