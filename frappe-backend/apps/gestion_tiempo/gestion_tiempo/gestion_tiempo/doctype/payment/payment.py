import frappe
from frappe.model.document import Document


class Payment(Document):
    def validate(self):
        self.validate_amount()

    def validate_amount(self):
        if self.amount <= 0:
            frappe.throw("Payment amount must be greater than zero")

    def before_submit(self):
        # Cannot submit failed payments
        if self.status == "Failed":
            frappe.throw("Cannot submit a failed payment")

    def on_update(self):
        # If payment completed, update subscription
        if self.status == "Completed" and self.subscription:
            self.update_subscription()

    def update_subscription(self):
        """Extend subscription when payment is completed"""
        from frappe.utils import add_months

        subscription = frappe.get_doc("Subscription", self.subscription)

        if subscription.billing_cycle == "Monthly":
            subscription.end_date = add_months(subscription.end_date, 1)
        else:
            subscription.end_date = add_months(subscription.end_date, 12)

        subscription.next_billing_date = subscription.end_date

        if subscription.status == "Expired":
            subscription.status = "Active"

        subscription.save(ignore_permissions=True)
