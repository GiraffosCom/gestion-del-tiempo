import frappe
from frappe.model.document import Document
from frappe.utils import nowdate, getdate


class Subscription(Document):
    def validate(self):
        self.validate_dates()
        self.check_active_subscription()

    def validate_dates(self):
        if self.start_date and self.end_date:
            if getdate(self.end_date) < getdate(self.start_date):
                frappe.throw("End date cannot be before start date")

    def check_active_subscription(self):
        """Ensure customer doesn't have multiple active subscriptions"""
        if self.status == "Active":
            existing = frappe.db.get_value(
                "Subscription",
                {
                    "customer": self.customer,
                    "status": "Active",
                    "name": ["!=", self.name]
                },
                "name"
            )
            if existing:
                frappe.throw(
                    f"Customer already has an active subscription: {existing}. "
                    "Please cancel or pause the existing subscription first."
                )

    def before_save(self):
        # Auto-expire if end_date has passed
        if self.status == "Active" and self.end_date:
            if getdate(self.end_date) < getdate(nowdate()):
                self.status = "Expired"

    def on_update(self):
        # Log status changes
        if self.has_value_changed("status"):
            frappe.get_doc({
                "doctype": "Usage Log",
                "customer": self.customer,
                "feature": "subscription_status_change",
                "details": f"Status changed to {self.status}",
                "log_date": nowdate()
            }).insert(ignore_permissions=True)
