# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_26_192531) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "citext"
  enable_extension "pg_catalog.plpgsql"

  create_table "account_login_change_keys", force: :cascade do |t|
    t.datetime "deadline", null: false
    t.string "key", null: false
    t.string "login", null: false
  end

  create_table "account_password_reset_keys", force: :cascade do |t|
    t.datetime "deadline", null: false
    t.datetime "email_last_sent", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.string "key", null: false
  end

  create_table "account_verification_keys", force: :cascade do |t|
    t.datetime "email_last_sent", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.string "key", null: false
    t.datetime "requested_at", default: -> { "CURRENT_TIMESTAMP" }, null: false
  end

  create_table "accounts", force: :cascade do |t|
    t.citext "email", null: false
    t.string "jwt_secret", default: "", null: false
    t.string "password_hash"
    t.integer "status", default: 1, null: false
    t.index ["email"], name: "index_accounts_on_email", unique: true, where: "(status = ANY (ARRAY[1, 2]))"
    t.check_constraint "email ~ '^[^,;@ \r\n]+@[^,@; \r\n]+.[^,@; \r\n]+$'::citext", name: "valid_email"
  end

  create_table "attendance_reports", force: :cascade do |t|
    t.integer "adults", default: 0, null: false
    t.integer "children", default: 0, null: false
    t.datetime "created_at", null: false
    t.bigint "ministry_id", null: false
    t.text "notes"
    t.bigint "reported_by_id", null: false
    t.bigint "service_id", null: false
    t.datetime "submitted_at"
    t.integer "total", default: 0, null: false
    t.datetime "updated_at", null: false
    t.integer "youth", default: 0, null: false
    t.index ["ministry_id"], name: "index_attendance_reports_on_ministry_id"
    t.index ["reported_by_id"], name: "index_attendance_reports_on_reported_by_id"
    t.index ["service_id"], name: "index_attendance_reports_on_service_id"
  end

  create_table "churches", force: :cascade do |t|
    t.string "address"
    t.string "city"
    t.datetime "created_at", null: false
    t.string "email"
    t.bigint "ministry_id", null: false
    t.string "name", null: false
    t.string "phone"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["ministry_id"], name: "index_churches_on_ministry_id"
  end

  create_table "contributions", force: :cascade do |t|
    t.decimal "amount", precision: 12, scale: 2, default: "0.0", null: false
    t.datetime "created_at", null: false
    t.string "currency", default: "MXN", null: false
    t.bigint "ministry_id", null: false
    t.text "notes"
    t.bigint "reported_by_id", null: false
    t.bigint "service_id", null: false
    t.datetime "submitted_at"
    t.string "type", null: false
    t.datetime "updated_at", null: false
    t.index ["ministry_id"], name: "index_contributions_on_ministry_id"
    t.index ["reported_by_id"], name: "index_contributions_on_reported_by_id"
    t.index ["service_id"], name: "index_contributions_on_service_id"
    t.index ["type"], name: "index_contributions_on_type"
  end

  create_table "ministries", force: :cascade do |t|
    t.string "city"
    t.string "country"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "slug", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_ministries_on_slug", unique: true
  end

  create_table "notifications", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "kind", null: false
    t.jsonb "payload", default: {}, null: false
    t.datetime "read_at"
    t.bigint "recipient_id", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_notifications_on_created_at"
    t.index ["recipient_id", "created_at"], name: "index_notifications_on_recipient_id_and_created_at"
    t.index ["recipient_id", "read_at"], name: "index_notifications_on_recipient_id_and_read_at"
    t.index ["recipient_id"], name: "index_notifications_on_recipient_id"
  end

  create_table "service_requests", force: :cascade do |t|
    t.bigint "church_id", null: false
    t.datetime "created_at", null: false
    t.bigint "ministry_id", null: false
    t.text "notes"
    t.bigint "requested_by_id", null: false
    t.datetime "requested_for", null: false
    t.bigint "reviewed_by_id"
    t.string "service_type", null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["church_id"], name: "index_service_requests_on_church_id"
    t.index ["ministry_id"], name: "index_service_requests_on_ministry_id"
    t.index ["requested_by_id"], name: "index_service_requests_on_requested_by_id"
    t.index ["reviewed_by_id"], name: "index_service_requests_on_reviewed_by_id"
  end

  create_table "services", force: :cascade do |t|
    t.bigint "church_id", null: false
    t.datetime "created_at", null: false
    t.bigint "ministry_id", null: false
    t.datetime "scheduled_at", null: false
    t.string "service_type", null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["church_id"], name: "index_services_on_church_id"
    t.index ["ministry_id"], name: "index_services_on_ministry_id"
  end

  create_table "users", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "church_id"
    t.datetime "created_at", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "locale", default: "es", null: false
    t.bigint "ministry_id"
    t.string "phone"
    t.integer "role", default: 3, null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_users_on_account_id", unique: true
    t.index ["church_id"], name: "index_users_on_church_id"
    t.index ["ministry_id", "role"], name: "index_users_on_ministry_id_and_role"
    t.index ["ministry_id"], name: "index_users_on_ministry_id"
  end

  add_foreign_key "account_login_change_keys", "accounts", column: "id"
  add_foreign_key "account_password_reset_keys", "accounts", column: "id"
  add_foreign_key "account_verification_keys", "accounts", column: "id"
  add_foreign_key "attendance_reports", "ministries"
  add_foreign_key "attendance_reports", "services"
  add_foreign_key "attendance_reports", "users", column: "reported_by_id"
  add_foreign_key "churches", "ministries"
  add_foreign_key "contributions", "ministries"
  add_foreign_key "contributions", "services"
  add_foreign_key "contributions", "users", column: "reported_by_id"
  add_foreign_key "notifications", "users", column: "recipient_id"
  add_foreign_key "service_requests", "churches"
  add_foreign_key "service_requests", "ministries"
  add_foreign_key "service_requests", "users", column: "requested_by_id"
  add_foreign_key "service_requests", "users", column: "reviewed_by_id"
  add_foreign_key "services", "churches"
  add_foreign_key "services", "ministries"
  add_foreign_key "users", "accounts"
  add_foreign_key "users", "churches"
  add_foreign_key "users", "ministries"
end
