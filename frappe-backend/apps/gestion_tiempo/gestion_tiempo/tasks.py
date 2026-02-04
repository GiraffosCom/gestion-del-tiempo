import frappe
from frappe.utils import nowdate, add_days, getdate


def check_expiring_subscriptions():
    """Check for subscriptions expiring in the next 7 days and send notifications"""
    seven_days_from_now = add_days(nowdate(), 7)

    expiring_subscriptions = frappe.get_all(
        "Subscription",
        filters={
            "status": "Active",
            "end_date": ["<=", seven_days_from_now],
            "end_date": [">=", nowdate()]
        },
        fields=["name", "customer", "plan", "end_date"]
    )

    for sub in expiring_subscriptions:
        customer = frappe.get_doc("Customer", sub.customer)
        plan = frappe.get_doc("Subscription Plan", sub.plan)

        # Log the expiring subscription
        frappe.get_doc({
            "doctype": "Usage Log",
            "customer": sub.customer,
            "feature": "subscription_expiring",
            "details": f"Subscription to {plan.plan_name} expires on {sub.end_date}",
            "log_date": nowdate()
        }).insert(ignore_permissions=True)

        # Here you would typically send an email notification
        # frappe.sendmail(
        #     recipients=[customer.email],
        #     subject=f"Tu suscripción a {plan.plan_name} está por vencer",
        #     message=f"Tu suscripción vence el {sub.end_date}. Renueva ahora para no perder acceso."
        # )


def generate_weekly_report():
    """Generate weekly subscription and revenue report"""
    from frappe.utils import add_days

    week_ago = add_days(nowdate(), -7)

    # New subscriptions this week
    new_subscriptions = frappe.db.count(
        "Subscription",
        filters={"creation": [">=", week_ago]}
    )

    # Cancelled subscriptions this week
    cancelled_subscriptions = frappe.db.count(
        "Subscription",
        filters={
            "status": "Cancelled",
            "modified": [">=", week_ago]
        }
    )

    # Revenue this week
    revenue = frappe.db.sql("""
        SELECT COALESCE(SUM(amount), 0) as total
        FROM `tabPayment`
        WHERE status = 'Completed'
        AND payment_date >= %s
    """, (week_ago,), as_dict=True)

    weekly_revenue = revenue[0].total if revenue else 0

    # Log the report
    report_data = {
        "new_subscriptions": new_subscriptions,
        "cancelled_subscriptions": cancelled_subscriptions,
        "weekly_revenue": weekly_revenue,
        "report_date": nowdate()
    }

    frappe.log_error(
        title="Weekly Subscription Report",
        message=str(report_data)
    )

    return report_data
