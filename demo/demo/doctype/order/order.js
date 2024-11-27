frappe.ui.form.on('Order', {
    refresh: function (frm) {
       // if (!frm.is_new() && frm.doc.status !== 'Billed') {
            frm.add_custom_button(__('Generate Bill'), function () {
                frappe.call({
                    method: 'demo.demo.doctype.order.order.generate_bill',
                    args: {
                        order_id: frm.doc.name,
                        dummy : 1
                    },
                    callback: function (r) {
                        if (r.message) {
                            frappe.show_alert({ message: __('Bill Generated Successfully'), indicator: 'green' });
                            frm.reload_doc();
                        }
                    }
                })
                 .then(r => {
                console.log(r.message)
            })
            }, __('Actions'));
        //}
    },
    items_add: function (frm, cdt, cdn) {
        let child = frappe.get_doc(cdt, cdn); // select * from items where id = 1
        if (child.item_id) {
            frappe.db.get_value('Items', { name: child.item_id }, 'price', (r) => {
                if (r && r.price) {
                    frappe.model.set_value(cdt, cdn, 'price', r.price);
                    calculate_row_total(child, frm);
                }
            });
        }
    },
    items_remove: function (frm) {
        calculate_total(frm);
    }
});

frappe.ui.form.on('Order Item', {
    qty: function (frm, cdt, cdn) {
        let child = frappe.get_doc(cdt, cdn);
        if (child.item_id && child.qty) {
            frappe.db.get_value('Items', { name: child.item_id }, 'price', (r) => {
                if (r && r.price) {
                    frappe.model.set_value(cdt, cdn, 'price', r.price);
                    calculate_row_total(child, frm);
                }
            });
        }
    },
    item_id: function (frm, cdt, cdn) {
        let child = frappe.get_doc(cdt, cdn);
        if (child.item_id) {
            frappe.db.get_value('Items', { name: child.item_id }, 'price', (r) => {
                if (r && r.price) {
                    frappe.model.set_value(cdt, cdn, 'price', r.price);
                    calculate_row_total(child, frm);
                }
            });
        }
    }
});

function calculate_row_total(row, frm) {
    let total_price = row.qty * row.price;
    frappe.model.set_value(row.doctype, row.name, 'total_price', total_price);
    calculate_total(frm);
}

function calculate_total(frm) {
    let total = 0;
    (frm.doc.items || []).forEach((item) => {
        total += item.total_price;
    });
    frm.set_value('total', total);
}