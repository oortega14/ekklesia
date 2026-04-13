class AddMissingForeignKeyIndexes < ActiveRecord::Migration[8.1]
  def change
    add_index :service_requests,   :requested_by_id, if_not_exists: true
    add_index :service_requests,   :reviewed_by_id,  if_not_exists: true
    add_index :attendance_reports, :reported_by_id,  if_not_exists: true
    add_index :contributions,      :reported_by_id,  if_not_exists: true
    # Also add a composite index for common role-based queries
    add_index :users, [:ministry_id, :role], if_not_exists: true
  end
end
