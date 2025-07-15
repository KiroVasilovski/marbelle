from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailVerificationToken, PasswordResetToken

User = get_user_model()


class UserModelTest(TestCase):
    """Test the User model."""

    def setUp(self):
        self.user_data = {
            "email": "test@example.com",
            "username": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "TestPassword123",
        }

    def test_create_user(self):
        """Test creating a regular user."""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.email, self.user_data["email"])
        self.assertTrue(user.check_password(self.user_data["password"]))
        self.assertFalse(user.is_business_customer)

    def test_create_business_user(self):
        """Test creating a business user."""
        business_data = self.user_data.copy()
        business_data["company_name"] = "Test Company"
        user = User.objects.create_user(**business_data)
        self.assertTrue(user.is_business_customer)

    def test_user_string_representation(self):
        """Test user string representation."""
        user = User.objects.create_user(**self.user_data)
        expected = f"{user.get_full_name()}"
        self.assertEqual(str(user), expected)

    def test_business_user_string_representation(self):
        """Test business user string representation."""
        business_data = self.user_data.copy()
        business_data["company_name"] = "Test Company"
        user = User.objects.create_user(**business_data)
        expected = f"{user.get_full_name()} ({user.company_name})"
        self.assertEqual(str(user), expected)


class EmailVerificationTokenTest(TestCase):
    """Test the EmailVerificationToken model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
        )

    def test_token_creation(self):
        """Test token is created with proper fields."""
        token = EmailVerificationToken.objects.create(user=self.user)
        self.assertIsNotNone(token.token)
        self.assertIsNotNone(token.expires_at)
        self.assertFalse(token.is_used)
        self.assertTrue(token.is_valid)

    def test_token_expiration(self):
        """Test token expiration."""
        from datetime import timedelta

        from django.utils import timezone

        token = EmailVerificationToken.objects.create(user=self.user)
        token.expires_at = timezone.now() - timedelta(hours=1)
        token.save()
        self.assertTrue(token.is_expired)
        self.assertFalse(token.is_valid)

    def test_token_used(self):
        """Test used token validation."""
        token = EmailVerificationToken.objects.create(user=self.user)
        token.is_used = True
        token.save()
        self.assertFalse(token.is_valid)


class PasswordResetTokenTest(TestCase):
    """Test the PasswordResetToken model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
        )

    def test_token_creation(self):
        """Test token is created with proper fields."""
        token = PasswordResetToken.objects.create(user=self.user)
        self.assertIsNotNone(token.token)
        self.assertIsNotNone(token.expires_at)
        self.assertFalse(token.is_used)
        self.assertTrue(token.is_valid)


class AuthenticationAPITest(APITestCase):
    """Test authentication API endpoints."""

    def setUp(self):
        self.register_url = reverse("users:register")
        self.login_url = reverse("users:login")
        self.verify_email_url = reverse("users:verify-email")
        self.password_reset_url = reverse("users:password-reset")
        self.password_reset_confirm_url = reverse("users:password-reset-confirm")
        self.verify_token_url = reverse("users:verify-token")

        self.user_data = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "TestPassword123",
            "password_confirm": "TestPassword123",
        }

    def test_user_registration(self):
        """Test user registration endpoint."""
        response = self.client.post(self.register_url, self.user_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertIn("user_id", response.data["data"])

        # Check user is created but inactive
        user = User.objects.get(email=self.user_data["email"])
        self.assertFalse(user.is_active)

    def test_user_registration_validation(self):
        """Test user registration validation."""
        invalid_data = self.user_data.copy()
        invalid_data["password_confirm"] = "DifferentPassword"

        response = self.client.post(self.register_url, invalid_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_email_verification(self):
        """Test email verification endpoint."""
        # Create user and token
        user = User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
            is_active=False,
        )
        token = EmailVerificationToken.objects.create(user=user)

        # Verify email
        response = self.client.post(self.verify_email_url, {"token": token.token}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

        # Check user is activated
        user.refresh_from_db()
        self.assertTrue(user.is_active)

    def test_login_inactive_user(self):
        """Test login with inactive user."""
        User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
            is_active=False,
        )

        login_data = {"email": "test@example.com", "password": "TestPassword123"}
        response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_login_active_user(self):
        """Test login with active user."""
        User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
            is_active=True,
        )

        login_data = {"email": "test@example.com", "password": "TestPassword123"}
        response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("access", response.data["data"])
        self.assertIn("refresh", response.data["data"])
        self.assertIn("user", response.data["data"])

    def test_password_reset_request(self):
        """Test password reset request."""
        User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
            is_active=True,
        )

        response = self.client.post(self.password_reset_url, {"email": "test@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

    def test_password_reset_confirm(self):
        """Test password reset confirmation."""
        user = User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
            is_active=True,
        )
        token = PasswordResetToken.objects.create(user=user)

        reset_data = {
            "token": token.token,
            "new_password": "NewPassword123",
            "new_password_confirm": "NewPassword123",
        }
        response = self.client.post(self.password_reset_confirm_url, reset_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

        # Verify password was changed
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewPassword123"))

    def test_token_verification(self):
        """Test JWT token verification."""
        user = User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
            is_active=True,
        )

        # Get token for user
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Test token verification
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.get(self.verify_token_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["id"], user.id)

    def test_token_verification_invalid_token(self):
        """Test JWT token verification with invalid token."""
        self.client.credentials(HTTP_AUTHORIZATION="Bearer invalid_token")
        response = self.client.get(self.verify_token_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
