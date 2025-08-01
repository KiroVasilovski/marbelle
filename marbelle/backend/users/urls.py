from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

# Router for ViewSets
router = DefaultRouter()
router.register(r"auth/addresses", views.AddressViewSet, basename="address")

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
    # Email change endpoints
    path("auth/request-email-change/", views.request_email_change, name="request-email-change"),
    path("auth/confirm-email-change/", views.confirm_email_change, name="confirm-email-change"),
    # Dashboard endpoints
    path("auth/user/", views.user_profile, name="user-profile"),
    path("auth/change-password/", views.change_password, name="change-password"),
    # Include router URLs for AddressViewSet
    path("", include(router.urls)),
]
