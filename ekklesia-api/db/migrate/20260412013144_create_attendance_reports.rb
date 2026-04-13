class CreateAttendanceReports < ActiveRecord::Migration[8.0]
  def change
    create_table :attendance_reports do |t|
      t.references :ministry, null: false, foreign_key: true
      t.references :service,  null: false, foreign_key: true
      t.bigint     :reported_by_id, null: false
      t.integer    :adults,   null: false, default: 0
      t.integer    :youth,    null: false, default: 0
      t.integer    :children, null: false, default: 0
      t.integer    :total,    null: false, default: 0
      t.text       :notes
      t.datetime   :submitted_at
      t.timestamps
    end
    add_foreign_key :attendance_reports, :users, column: :reported_by_id
  end
end
