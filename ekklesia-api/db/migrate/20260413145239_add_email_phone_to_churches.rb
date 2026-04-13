class AddEmailPhoneToChurches < ActiveRecord::Migration[8.1]
  def change
    add_column :churches, :email, :string
    add_column :churches, :phone, :string
  end
end
