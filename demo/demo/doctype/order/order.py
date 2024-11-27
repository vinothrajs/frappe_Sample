# Copyright (c) 2024, demo and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import frappe
from frappe.utils import nowdate

class Order(Document):
	pass

@frappe.whitelist()
def generate_bill(order_id , dummy):
	# Fetch the Order details
	order = frappe.get_doc('Order', order_id) # select * from taborder where id = order_id
	# if order.order_status == 'Billed':
	# 	frappe.throw('Bill has already been generated for this Order.')

	if not order.items:
		frappe.throw('No items found in the order to generate the bill.')

	# Create a new Bill
	bill = frappe.new_doc('Bill') # insert tabbill into value()
	bill.bill_date = nowdate()
	bill.order_id = order_id
	bill.total = order.total

	# Add items to Bill Details
	for item in order.items:
		bill.append('items', {
			'item_id': item.item_id,
			'qty': item.qty,
			'price': item.price,
			'total_price': item.total_price
		})

	# Save the Bill
	bill.insert()
	frappe.db.commit() 

	# Update Order status to 'Billed'
	order.status = 'Billed'
	order.save()

	return bill.name

