import frappe
from frappe import _
from frappe.utils import nowdate, add_days, add_months, getdate, flt
from datetime import datetime, timedelta


@frappe.whitelist(allow_guest=True)
def get_subscription_plans():
    """Get all active subscription plans"""
    plans = frappe.get_all(
        "Subscription Plan",
        filters={"is_active": 1},
        fields=["name", "plan_name", "price_monthly", "price_yearly", "features", "max_habits", "max_goals", "has_statistics", "has_export", "has_priority_support"]
    )
    return plans


@frappe.whitelist()
def get_dashboard_stats():
    """Get dashboard statistics for backoffice"""
    # Total customers
    total_customers = frappe.db.count("Customer")

    # Active subscriptions
    active_subscriptions = frappe.db.count("Subscription", filters={"status": "Active"})

    # MRR (Monthly Recurring Revenue)
    mrr = frappe.db.sql("""
        SELECT SUM(
            CASE
                WHEN s.billing_cycle = 'Monthly' THEN sp.price_monthly
                WHEN s.billing_cycle = 'Yearly' THEN sp.price_yearly / 12
                ELSE 0
            END
        ) as mrr
        FROM `tabSubscription` s
        JOIN `tabSubscription Plan` sp ON s.plan = sp.name
        WHERE s.status = 'Active'
    """, as_dict=True)
    mrr_value = flt(mrr[0].mrr) if mrr and mrr[0].mrr else 0

    # New customers this month
    first_day_of_month = getdate(nowdate()).replace(day=1)
    new_customers_month = frappe.db.count(
        "Customer",
        filters={"creation": [">=", first_day_of_month]}
    )

    # Churn rate (cancelled in last 30 days / active at start of period)
    thirty_days_ago = add_days(nowdate(), -30)
    cancelled_subscriptions = frappe.db.count(
        "Subscription",
        filters={
            "status": "Cancelled",
            "modified": [">=", thirty_days_ago]
        }
    )

    active_at_period_start = active_subscriptions + cancelled_subscriptions
    churn_rate = (cancelled_subscriptions / active_at_period_start * 100) if active_at_period_start > 0 else 0

    # Revenue by plan
    revenue_by_plan = frappe.db.sql("""
        SELECT
            sp.plan_name,
            COUNT(s.name) as subscriptions,
            SUM(
                CASE
                    WHEN s.billing_cycle = 'Monthly' THEN sp.price_monthly
                    WHEN s.billing_cycle = 'Yearly' THEN sp.price_yearly / 12
                    ELSE 0
                END
            ) as monthly_revenue
        FROM `tabSubscription` s
        JOIN `tabSubscription Plan` sp ON s.plan = sp.name
        WHERE s.status = 'Active'
        GROUP BY sp.plan_name
    """, as_dict=True)

    # Customers by plan
    customers_by_plan = frappe.db.sql("""
        SELECT
            sp.plan_name,
            COUNT(DISTINCT s.customer) as customer_count
        FROM `tabSubscription` s
        JOIN `tabSubscription Plan` sp ON s.plan = sp.name
        WHERE s.status = 'Active'
        GROUP BY sp.plan_name
    """, as_dict=True)

    # Monthly revenue trend (last 6 months)
    revenue_trend = []
    for i in range(5, -1, -1):
        month_start = add_months(getdate(nowdate()).replace(day=1), -i)
        month_end = add_months(month_start, 1)

        month_revenue = frappe.db.sql("""
            SELECT COALESCE(SUM(amount), 0) as total
            FROM `tabPayment`
            WHERE status = 'Completed'
            AND payment_date >= %s AND payment_date < %s
        """, (month_start, month_end), as_dict=True)

        revenue_trend.append({
            "month": month_start.strftime("%b %Y"),
            "revenue": flt(month_revenue[0].total) if month_revenue else 0
        })

    return {
        "total_customers": total_customers,
        "active_subscriptions": active_subscriptions,
        "mrr": mrr_value,
        "new_customers_month": new_customers_month,
        "churn_rate": round(churn_rate, 2),
        "revenue_by_plan": revenue_by_plan,
        "customers_by_plan": customers_by_plan,
        "revenue_trend": revenue_trend
    }


@frappe.whitelist()
def create_subscription(customer, plan, billing_cycle="Monthly"):
    """Create a new subscription for a customer"""
    # Check if customer exists
    if not frappe.db.exists("Customer", customer):
        frappe.throw(_("Customer not found"))

    # Check if plan exists
    if not frappe.db.exists("Subscription Plan", plan):
        frappe.throw(_("Subscription plan not found"))

    # Check if customer already has an active subscription
    existing = frappe.db.exists(
        "Subscription",
        {"customer": customer, "status": "Active"}
    )
    if existing:
        frappe.throw(_("Customer already has an active subscription"))

    # Get plan details
    plan_doc = frappe.get_doc("Subscription Plan", plan)

    # Calculate end date
    start_date = nowdate()
    if billing_cycle == "Monthly":
        end_date = add_months(start_date, 1)
    else:
        end_date = add_months(start_date, 12)

    # Create subscription
    subscription = frappe.get_doc({
        "doctype": "Subscription",
        "customer": customer,
        "plan": plan,
        "status": "Active",
        "billing_cycle": billing_cycle,
        "start_date": start_date,
        "end_date": end_date,
        "next_billing_date": end_date
    })
    subscription.insert()

    return subscription


@frappe.whitelist()
def cancel_subscription(subscription_id, reason=""):
    """Cancel a subscription"""
    if not frappe.db.exists("Subscription", subscription_id):
        frappe.throw(_("Subscription not found"))

    subscription = frappe.get_doc("Subscription", subscription_id)

    if subscription.status == "Cancelled":
        frappe.throw(_("Subscription is already cancelled"))

    subscription.status = "Cancelled"
    subscription.cancellation_date = nowdate()
    subscription.cancellation_reason = reason
    subscription.save()

    return {"status": "success", "message": _("Subscription cancelled successfully")}


@frappe.whitelist()
def upgrade_plan(subscription_id, new_plan):
    """Upgrade or downgrade subscription plan"""
    if not frappe.db.exists("Subscription", subscription_id):
        frappe.throw(_("Subscription not found"))

    if not frappe.db.exists("Subscription Plan", new_plan):
        frappe.throw(_("New plan not found"))

    subscription = frappe.get_doc("Subscription", subscription_id)

    if subscription.status != "Active":
        frappe.throw(_("Can only upgrade active subscriptions"))

    old_plan = subscription.plan
    subscription.plan = new_plan
    subscription.save()

    # Log the change
    frappe.get_doc({
        "doctype": "Usage Log",
        "customer": subscription.customer,
        "feature": "plan_change",
        "details": f"Changed from {old_plan} to {new_plan}",
        "log_date": nowdate()
    }).insert()

    return {
        "status": "success",
        "message": _("Plan upgraded successfully"),
        "old_plan": old_plan,
        "new_plan": new_plan
    }


@frappe.whitelist()
def process_payment(customer, subscription, amount, payment_method, transaction_id=""):
    """Process a payment"""
    if not frappe.db.exists("Customer", customer):
        frappe.throw(_("Customer not found"))

    if subscription and not frappe.db.exists("Subscription", subscription):
        frappe.throw(_("Subscription not found"))

    payment = frappe.get_doc({
        "doctype": "Payment",
        "customer": customer,
        "subscription": subscription,
        "amount": flt(amount),
        "payment_date": nowdate(),
        "payment_method": payment_method,
        "status": "Completed",
        "transaction_id": transaction_id
    })
    payment.insert()

    # Update subscription end date if applicable
    if subscription:
        sub_doc = frappe.get_doc("Subscription", subscription)
        if sub_doc.billing_cycle == "Monthly":
            sub_doc.end_date = add_months(sub_doc.end_date, 1)
        else:
            sub_doc.end_date = add_months(sub_doc.end_date, 12)
        sub_doc.next_billing_date = sub_doc.end_date
        sub_doc.save()

    return payment


@frappe.whitelist()
def get_customer_details(customer_email):
    """Get full customer details including subscription and payment history"""
    customer = frappe.db.get_value(
        "Customer",
        {"email": customer_email},
        ["name", "full_name", "email", "phone", "company", "creation"],
        as_dict=True
    )

    if not customer:
        frappe.throw(_("Customer not found"))

    # Get active subscription
    subscription = frappe.db.get_value(
        "Subscription",
        {"customer": customer.name, "status": "Active"},
        ["name", "plan", "status", "billing_cycle", "start_date", "end_date"],
        as_dict=True
    )

    # Get plan details if subscription exists
    plan_details = None
    if subscription:
        plan_details = frappe.db.get_value(
            "Subscription Plan",
            subscription.plan,
            ["plan_name", "price_monthly", "price_yearly", "features"],
            as_dict=True
        )

    # Get payment history
    payments = frappe.get_all(
        "Payment",
        filters={"customer": customer.name},
        fields=["name", "amount", "payment_date", "payment_method", "status"],
        order_by="payment_date desc",
        limit=10
    )

    return {
        "customer": customer,
        "subscription": subscription,
        "plan_details": plan_details,
        "payments": payments
    }


@frappe.whitelist()
def get_customers_list(filters=None, page=1, page_size=20):
    """Get paginated list of customers"""
    start = (int(page) - 1) * int(page_size)

    query_filters = {}
    if filters:
        if isinstance(filters, str):
            import json
            filters = json.loads(filters)
        query_filters = filters

    customers = frappe.get_all(
        "Customer",
        filters=query_filters,
        fields=["name", "full_name", "email", "phone", "company", "creation"],
        order_by="creation desc",
        start=start,
        page_length=int(page_size)
    )

    # Get subscription info for each customer
    for customer in customers:
        sub = frappe.db.get_value(
            "Subscription",
            {"customer": customer.name, "status": "Active"},
            ["plan", "status", "end_date"],
            as_dict=True
        )
        customer["subscription"] = sub
        if sub:
            plan_name = frappe.db.get_value("Subscription Plan", sub.plan, "plan_name")
            customer["plan_name"] = plan_name

    total = frappe.db.count("Customer", filters=query_filters)

    return {
        "customers": customers,
        "total": total,
        "page": int(page),
        "page_size": int(page_size),
        "total_pages": -(-total // int(page_size))  # Ceiling division
    }


@frappe.whitelist()
def get_subscriptions_list(filters=None, page=1, page_size=20):
    """Get paginated list of subscriptions"""
    start = (int(page) - 1) * int(page_size)

    query_filters = {}
    if filters:
        if isinstance(filters, str):
            import json
            filters = json.loads(filters)
        query_filters = filters

    subscriptions = frappe.get_all(
        "Subscription",
        filters=query_filters,
        fields=["name", "customer", "plan", "status", "billing_cycle", "start_date", "end_date", "next_billing_date"],
        order_by="creation desc",
        start=start,
        page_length=int(page_size)
    )

    # Enrich with customer and plan details
    for sub in subscriptions:
        customer = frappe.db.get_value("Customer", sub.customer, ["full_name", "email"], as_dict=True)
        sub["customer_name"] = customer.full_name if customer else ""
        sub["customer_email"] = customer.email if customer else ""

        plan = frappe.db.get_value("Subscription Plan", sub.plan, "plan_name")
        sub["plan_name"] = plan or ""

    total = frappe.db.count("Subscription", filters=query_filters)

    return {
        "subscriptions": subscriptions,
        "total": total,
        "page": int(page),
        "page_size": int(page_size),
        "total_pages": -(-total // int(page_size))
    }


@frappe.whitelist()
def get_payments_list(filters=None, page=1, page_size=20):
    """Get paginated list of payments"""
    start = (int(page) - 1) * int(page_size)

    query_filters = {}
    if filters:
        if isinstance(filters, str):
            import json
            filters = json.loads(filters)
        query_filters = filters

    payments = frappe.get_all(
        "Payment",
        filters=query_filters,
        fields=["name", "customer", "subscription", "amount", "payment_date", "payment_method", "status", "transaction_id"],
        order_by="payment_date desc",
        start=start,
        page_length=int(page_size)
    )

    # Enrich with customer details
    for payment in payments:
        customer = frappe.db.get_value("Customer", payment.customer, ["full_name", "email"], as_dict=True)
        payment["customer_name"] = customer.full_name if customer else ""
        payment["customer_email"] = customer.email if customer else ""

    total = frappe.db.count("Payment", filters=query_filters)

    return {
        "payments": payments,
        "total": total,
        "page": int(page),
        "page_size": int(page_size),
        "total_pages": -(-total // int(page_size))
    }


@frappe.whitelist()
def export_report(report_type, date_from=None, date_to=None, format="csv"):
    """Export report data"""
    if report_type == "customers":
        data = frappe.get_all(
            "Customer",
            fields=["full_name", "email", "phone", "company", "creation"]
        )
    elif report_type == "subscriptions":
        data = frappe.db.sql("""
            SELECT
                c.full_name, c.email, sp.plan_name, s.status,
                s.billing_cycle, s.start_date, s.end_date
            FROM `tabSubscription` s
            JOIN `tabCustomer` c ON s.customer = c.name
            JOIN `tabSubscription Plan` sp ON s.plan = sp.name
            WHERE (%s IS NULL OR s.start_date >= %s)
            AND (%s IS NULL OR s.end_date <= %s)
        """, (date_from, date_from, date_to, date_to), as_dict=True)
    elif report_type == "payments":
        data = frappe.db.sql("""
            SELECT
                c.full_name, c.email, p.amount, p.payment_date,
                p.payment_method, p.status, p.transaction_id
            FROM `tabPayment` p
            JOIN `tabCustomer` c ON p.customer = c.name
            WHERE (%s IS NULL OR p.payment_date >= %s)
            AND (%s IS NULL OR p.payment_date <= %s)
        """, (date_from, date_from, date_to, date_to), as_dict=True)
    elif report_type == "revenue":
        data = frappe.db.sql("""
            SELECT
                DATE_FORMAT(payment_date, '%%Y-%%m') as month,
                SUM(amount) as total_revenue,
                COUNT(*) as payment_count
            FROM `tabPayment`
            WHERE status = 'Completed'
            AND (%s IS NULL OR payment_date >= %s)
            AND (%s IS NULL OR payment_date <= %s)
            GROUP BY DATE_FORMAT(payment_date, '%%Y-%%m')
            ORDER BY month
        """, (date_from, date_from, date_to, date_to), as_dict=True)
    else:
        frappe.throw(_("Invalid report type"))

    return data


@frappe.whitelist()
def extend_subscription(subscription_id, days):
    """Extend subscription end date by specified days"""
    if not frappe.db.exists("Subscription", subscription_id):
        frappe.throw(_("Subscription not found"))

    subscription = frappe.get_doc("Subscription", subscription_id)
    subscription.end_date = add_days(subscription.end_date, int(days))
    subscription.next_billing_date = subscription.end_date
    subscription.save()

    return {
        "status": "success",
        "message": _("Subscription extended by {0} days").format(days),
        "new_end_date": subscription.end_date
    }


@frappe.whitelist(allow_guest=True)
def check_subscription_status(email):
    """Check if a user has an active subscription (for frontend verification)"""
    customer = frappe.db.get_value("Customer", {"email": email}, "name")

    if not customer:
        return {"has_subscription": False, "plan": None}

    subscription = frappe.db.get_value(
        "Subscription",
        {"customer": customer, "status": "Active"},
        ["plan", "end_date"],
        as_dict=True
    )

    if not subscription:
        return {"has_subscription": False, "plan": None}

    plan = frappe.db.get_value(
        "Subscription Plan",
        subscription.plan,
        ["plan_name", "max_habits", "max_goals", "has_statistics", "has_export", "has_priority_support"],
        as_dict=True
    )

    return {
        "has_subscription": True,
        "plan": plan,
        "end_date": subscription.end_date
    }
