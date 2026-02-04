import frappe
from frappe.model.document import Document


class Customer(Document):
    def validate(self):
        self.validate_email()

    def validate_email(self):
        if self.email:
            self.email = self.email.lower().strip()
            # Check for duplicate email
            existing = frappe.db.get_value(
                "Customer",
                {"email": self.email, "name": ["!=", self.name]},
                "name"
            )
            if existing:
                frappe.throw(f"A customer with email {self.email} already exists")

    def before_insert(self):
        # Set default values if needed
        pass

    def after_insert(self):
        # Create a free subscription for new customers
        free_plan = frappe.db.get_value("Subscription Plan", {"plan_name": "Free"}, "name")
        if free_plan:
            from frappe.utils import nowdate, add_months
            frappe.get_doc({
                "doctype": "Subscription",
                "customer": self.name,
                "plan": free_plan,
                "status": "Active",
                "billing_cycle": "Monthly",
                "start_date": nowdate(),
                "end_date": add_months(nowdate(), 1),
                "next_billing_date": add_months(nowdate(), 1)
            }).insert(ignore_permissions=True)
