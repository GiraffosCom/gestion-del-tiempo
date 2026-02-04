import frappe
from frappe.model.document import Document


class SubscriptionPlan(Document):
    def validate(self):
        self.validate_prices()
        self.validate_limits()

    def validate_prices(self):
        if self.price_monthly < 0:
            frappe.throw("Monthly price cannot be negative")
        if self.price_yearly < 0:
            frappe.throw("Yearly price cannot be negative")
        # Yearly should generally be cheaper per month than monthly
        if self.price_yearly > 0 and self.price_monthly > 0:
            monthly_equivalent = self.price_yearly / 12
            if monthly_equivalent > self.price_monthly:
                frappe.msgprint(
                    "Note: Yearly price per month is higher than monthly price. "
                    "Consider offering a discount for yearly plans."
                )

    def validate_limits(self):
        if self.max_habits < 0:
            frappe.throw("Max habits cannot be negative")
        if self.max_goals < 0:
            frappe.throw("Max goals cannot be negative")
