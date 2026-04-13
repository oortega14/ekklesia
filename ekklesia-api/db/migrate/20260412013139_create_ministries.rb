class CreateMinistries < ActiveRecord::Migration[8.0]
  def change
    create_table :ministries do |t|
      t.string :name,    null: false
      t.string :slug,    null: false
      t.string :country
      t.string :city
      t.timestamps
    end
    add_index :ministries, :slug, unique: true
  end
end
