from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = "users"

urlpatterns = [
    # Authentication endpoints
    path("auth/register/", views.register_user, name="register"),
    path("auth/login/", views.login_user, name="login"),
    path("auth/logout/", views.logout_user, name="logout"),
    path("auth/verify-email/", views.verify_email, name="verify-email"),
    path("auth/resend-verification/", views.resend_verification_email, name="resend-verification"),
    path("auth/password-reset/", views.request_password_reset, name="password-reset"),
    path("auth/password-reset-confirm/", views.confirm_password_reset, name="password-reset-confirm"),
    path("auth/verify-token/", views.verify_token, name="verify-token"),
    path("auth/refresh-token/", TokenRefreshView.as_view(), name="refresh-token"),
]
