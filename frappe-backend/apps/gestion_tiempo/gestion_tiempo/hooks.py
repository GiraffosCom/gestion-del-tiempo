app_name = "gestion_tiempo"
app_title = "Gestion del Tiempo"
app_publisher = "Gestion del Tiempo"
app_description = "Backend para gestionar suscripciones, clientes y pagos"
app_email = "admin@gestiontiempo.app"
app_license = "MIT"
app_version = "0.0.1"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/gestion_tiempo/css/gestion_tiempo.css"
# app_include_js = "/assets/gestion_tiempo/js/gestion_tiempo.js"

# include js, css files in header of web template
# web_include_css = "/assets/gestion_tiempo/css/gestion_tiempo.css"
# web_include_js = "/assets/gestion_tiempo/js/gestion_tiempo.js"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "gestion_tiempo.install.before_install"
# after_install = "gestion_tiempo.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "gestion_tiempo.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
#	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
#	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
#	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
#	"*": {
#		"on_update": "method",
#		"on_cancel": "method",
#		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

scheduler_events = {
    "daily": [
        "gestion_tiempo.tasks.check_expiring_subscriptions"
    ],
    "weekly": [
        "gestion_tiempo.tasks.generate_weekly_report"
    ]
}

# Testing
# -------

# before_tests = "gestion_tiempo.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
#	"frappe.desk.doctype.event.event.get_events": "gestion_tiempo.event.get_events"
# }

# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
#	"Task": "gestion_tiempo.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# User Data Protection
# --------------------

user_data_fields = [
    {
        "doctype": "{doctype_1}",
        "filter_by": "{filter_by}",
        "redact_fields": ["{field_1}", "{field_2}"],
        "partial": 1,
    },
]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#	"gestion_tiempo.auth.validate"
# ]

# API whitelist
# --------------------------------
# Allow guest access to these methods
# guest_allowed_methods = ["gestion_tiempo.api.get_subscription_plans"]

# CORS Settings
# --------------------------------
# Allow cross-origin requests
allow_cors = "*"
