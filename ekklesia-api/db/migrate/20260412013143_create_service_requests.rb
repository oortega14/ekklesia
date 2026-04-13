class CreateServiceRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :service_requests do |t|
      t.references :ministry,     null: false, foreign_key: true
      t.references :church,       null: false, foreign_key: true
      t.bigint     :requested_by_id, null: false
      t.bigint     :reviewed_by_id,  null: true
      t.string     :service_type,    null: false
      t.datetime   :requested_for,   null: false
      t.text       :notes
      t.integer    :status, null: false, default: 0  # 0=pending,1=approved,2=rejected
      t.timestamps
    end
    add_foreign_key :service_requests, :users, column: :requested_by_id
    add_foreign_key :service_requests, :users, column: :reviewed_by_id
  end
end
