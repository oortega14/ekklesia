class CreateContributions < ActiveRecord::Migration[8.0]
  def change
    create_table :contributions do |t|
      t.string     :type,          null: false  # STI discriminator
      t.references :ministry,      null: false, foreign_key: true
      t.references :service,       null: false, foreign_key: true
      t.bigint     :reported_by_id, null: false
      t.decimal    :amount, precision: 12, scale: 2, null: false, default: 0
      t.string     :currency, null: false, default: 'MXN'
      t.text       :notes
      t.datetime   :submitted_at
      t.timestamps
    end
    add_foreign_key :contributions, :users, column: :reported_by_id
    add_index :contributions, :type
  end
end
