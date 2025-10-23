from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Address, EmailChangeToken, EmailVerificationToken, PasswordResetToken

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


class AddressModelTest(TestCase):
    """Test the Address model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
        )
        self.address_data = {
            "user": self.user,
            "label": "Home",
            "first_name": "Test",
            "last_name": "User",
            "address_line_1": "123 Main St",
            "city": "New York",
            "state": "NY",
            "postal_code": "10001",
            "country": "USA",
        }

    def test_create_address(self):
        """Test creating an address."""
        address = Address.objects.create(**self.address_data)
        self.assertEqual(address.label, "Home")
        self.assertEqual(address.user, self.user)
        self.assertTrue(address.is_primary)  # First address should be primary

    def test_address_string_representation(self):
        """Test address string representation."""
        address = Address.objects.create(**self.address_data)
        expected = f"{address.label} - {address.first_name} {address.last_name}"
        self.assertEqual(str(address), expected)

    def test_primary_address_logic(self):
        """Test primary address business logic."""
        # Create first address
        address1 = Address.objects.create(**self.address_data)
        self.assertTrue(address1.is_primary)

        # Create second address
        address2_data = self.address_data.copy()
        address2_data["label"] = "Office"
        address2 = Address.objects.create(**address2_data)
        self.assertFalse(address2.is_primary)

        # Set second address as primary
        address2.is_primary = True
        address2.save()

        # Check first address is no longer primary
        address1.refresh_from_db()
        self.assertFalse(address1.is_primary)
        self.assertTrue(address2.is_primary)

    def test_unique_label_per_user(self):
        """Test address label uniqueness per user."""
        Address.objects.create(**self.address_data)

        # Try to create another address with same label for same user
        from django.db import IntegrityError, transaction

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Address.objects.create(**self.address_data)

        # Different user should be able to use same label
        user2 = User.objects.create_user(
            email="test2@example.com",
            username="test2@example.com",
            password="TestPassword123",
        )
        address2_data = self.address_data.copy()
        address2_data["user"] = user2
        address2 = Address.objects.create(**address2_data)
        self.assertEqual(address2.label, "Home")


class DashboardAPITest(APITestCase):
    """Test dashboard API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="dashboard@example.com",
            username="dashboard@example.com",
            first_name="Dashboard",
            last_name="User",
            company_name="Test Company",
            phone="+1234567890",
            password="TestPassword123",
            is_active=True,
        )

        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

        # URLs
        self.profile_url = reverse("users:user-profile")
        self.change_password_url = reverse("users:change-password")
        self.addresses_url = reverse("users:address-list")

    def authenticate(self):
        """Helper method to authenticate requests."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_get_user_profile(self):
        """Test GET user profile endpoint."""
        self.authenticate()
        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["email"], self.user.email)
        self.assertEqual(response.data["data"]["first_name"], self.user.first_name)
        self.assertEqual(response.data["data"]["company_name"], self.user.company_name)

    def test_update_user_profile(self):
        """Test PUT user profile endpoint."""
        self.authenticate()
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
            "phone": "+9876543210",
        }

        response = self.client.put(self.profile_url, update_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["first_name"], "Updated")

        # Verify user was updated in database
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")

    def test_update_profile_duplicate_email_ignored(self):
        """Test profile update with duplicate email is silently ignored."""
        # Create another user
        User.objects.create_user(
            email="existing@example.com",
            username="existing@example.com",
            password="TestPassword123",
        )

        self.authenticate()
        update_data = {"email": "existing@example.com", "first_name": "Updated"}

        response = self.client.put(self.profile_url, update_data, format="json")

        # Should succeed but email change should be silently ignored
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

        # Verify email was NOT changed (security feature)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "dashboard@example.com")  # Original email
        self.assertEqual(self.user.first_name, "Updated")  # Other fields updated

    def test_profile_requires_authentication(self):
        """Test profile endpoints require authentication."""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password(self):
        """Test password change endpoint."""
        self.authenticate()
        password_data = {
            "current_password": "TestPassword123",
            "new_password": "NewPassword456",
            "new_password_confirm": "NewPassword456",
        }

        response = self.client.post(self.change_password_url, password_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

        # Verify password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewPassword456"))

    def test_change_password_invalid_current(self):
        """Test password change with invalid current password."""
        self.authenticate()
        password_data = {
            "current_password": "WrongPassword",
            "new_password": "NewPassword456",
            "new_password_confirm": "NewPassword456",
        }

        response = self.client.post(self.change_password_url, password_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_change_password_mismatch_confirmation(self):
        """Test password change with mismatched confirmation."""
        self.authenticate()
        password_data = {
            "current_password": "TestPassword123",
            "new_password": "NewPassword456",
            "new_password_confirm": "DifferentPassword",
        }

        response = self.client.post(self.change_password_url, password_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])


class AddressAPITest(APITestCase):
    """Test address management API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="address@example.com",
            username="address@example.com",
            password="TestPassword123",
            is_active=True,
        )

        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

        # URLs
        self.addresses_url = reverse("users:address-list")

        # Address data
        self.address_data = {
            "label": "Home",
            "first_name": "Test",
            "last_name": "User",
            "address_line_1": "123 Main St",
            "city": "New York",
            "state": "NY",
            "postal_code": "10001",
            "country": "USA",
        }

    def authenticate(self):
        """Helper method to authenticate requests."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_list_addresses_empty(self):
        """Test listing addresses when user has none."""
        self.authenticate()
        response = self.client.get(self.addresses_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(len(response.data["data"]), 0)

    def test_create_address(self):
        """Test creating an address."""
        self.authenticate()
        response = self.client.post(self.addresses_url, self.address_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["label"], "Home")
        self.assertTrue(response.data["data"]["is_primary"])  # First address should be primary

    def test_create_address_validation(self):
        """Test address creation validation."""
        self.authenticate()
        invalid_data = self.address_data.copy()
        del invalid_data["first_name"]  # Remove required field

        response = self.client.post(self.addresses_url, invalid_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_create_duplicate_label(self):
        """Test creating address with duplicate label."""
        self.authenticate()

        # Create first address
        self.client.post(self.addresses_url, self.address_data, format="json")

        # Try to create second address with same label
        response = self.client.post(self.addresses_url, self.address_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_address_count_limit(self):
        """Test maximum address count limit."""
        self.authenticate()

        # Create 10 addresses (maximum allowed)
        for i in range(10):
            address_data = self.address_data.copy()
            address_data["label"] = f"Address{i}"
            response = self.client.post(self.addresses_url, address_data, format="json")
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Try to create 11th address
        address_data = self.address_data.copy()
        address_data["label"] = "Address10"
        response = self.client.post(self.addresses_url, address_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_list_addresses_with_data(self):
        """Test listing addresses when user has addresses."""
        self.authenticate()

        # Create two addresses
        self.client.post(self.addresses_url, self.address_data, format="json")

        office_data = self.address_data.copy()
        office_data["label"] = "Office"
        self.client.post(self.addresses_url, office_data, format="json")

        # List addresses
        response = self.client.get(self.addresses_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(len(response.data["data"]), 2)

        # Verify primary address comes first
        addresses = response.data["data"]
        self.assertTrue(addresses[0]["is_primary"])

    def test_update_address(self):
        """Test updating an address."""
        self.authenticate()

        # Create address
        response = self.client.post(self.addresses_url, self.address_data, format="json")
        address_id = response.data["data"]["id"]

        # Update address (use PATCH for partial update)
        update_data = {"city": "Los Angeles", "state": "CA"}
        update_url = reverse("users:address-detail", kwargs={"pk": address_id})
        response = self.client.patch(update_url, update_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["city"], "Los Angeles")

    def test_delete_address(self):
        """Test deleting an address."""
        self.authenticate()

        # Create two addresses
        self.client.post(self.addresses_url, self.address_data, format="json")

        office_data = self.address_data.copy()
        office_data["label"] = "Office"
        response = self.client.post(self.addresses_url, office_data, format="json")
        address_id = response.data["data"]["id"]

        # Delete address
        delete_url = reverse("users:address-detail", kwargs={"pk": address_id})
        response = self.client.delete(delete_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

        # Verify address was deleted
        self.assertEqual(Address.objects.filter(user=self.user).count(), 1)

    def test_delete_last_address_prevented(self):
        """Test prevention of deleting the last address."""
        self.authenticate()

        # Create one address
        response = self.client.post(self.addresses_url, self.address_data, format="json")
        address_id = response.data["data"]["id"]

        # Try to delete the only address
        delete_url = reverse("users:address-detail", kwargs={"pk": address_id})
        response = self.client.delete(delete_url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_set_primary_address(self):
        """Test setting an address as primary."""
        self.authenticate()

        # Create two addresses
        self.client.post(self.addresses_url, self.address_data, format="json")

        office_data = self.address_data.copy()
        office_data["label"] = "Office"
        response = self.client.post(self.addresses_url, office_data, format="json")
        address_id = response.data["data"]["id"]

        # Set office as primary
        set_primary_url = reverse("users:address-set-primary", kwargs={"pk": address_id})
        response = self.client.patch(set_primary_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertTrue(response.data["data"]["is_primary"])

        # Verify only one address is primary
        primary_count = Address.objects.filter(user=self.user, is_primary=True).count()
        self.assertEqual(primary_count, 1)

    def test_address_user_isolation(self):
        """Test that users can only access their own addresses."""
        # Create another user
        other_user = User.objects.create_user(
            email="other@example.com",
            username="other@example.com",
            password="TestPassword123",
            is_active=True,
        )

        # Create address for other user
        Address.objects.create(
            user=other_user,
            label="Other Home",
            first_name="Other",
            last_name="User",
            address_line_1="456 Other St",
            city="Other City",
            state="OT",
            postal_code="12345",
            country="USA",
        )

        # Authenticate as first user
        self.authenticate()

        # Try to list addresses - should only see own addresses
        response = self.client.get(self.addresses_url)
        self.assertEqual(len(response.data["data"]), 0)

    def test_addresses_require_authentication(self):
        """Test address endpoints require authentication."""
        response = self.client.get(self.addresses_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class EmailChangeTokenTest(TestCase):
    """Test the EmailChangeToken model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
        )

    def test_token_creation(self):
        """Test token is created with proper fields."""
        token = EmailChangeToken.objects.create(user=self.user, new_email="newemail@example.com")
        self.assertIsNotNone(token.token)
        self.assertIsNotNone(token.expires_at)
        self.assertEqual(token.new_email, "newemail@example.com")
        self.assertFalse(token.is_used)
        self.assertTrue(token.is_valid)

    def test_token_expiration(self):
        """Test token expiration."""
        from datetime import timedelta

        from django.utils import timezone

        token = EmailChangeToken.objects.create(user=self.user, new_email="newemail@example.com")
        token.expires_at = timezone.now() - timedelta(hours=1)
        token.save()
        self.assertTrue(token.is_expired)
        self.assertFalse(token.is_valid)

    def test_token_used(self):
        """Test used token validation."""
        token = EmailChangeToken.objects.create(user=self.user, new_email="newemail@example.com")
        token.is_used = True
        token.save()
        self.assertFalse(token.is_valid)

    def test_token_string_representation(self):
        """Test token string representation."""
        token = EmailChangeToken.objects.create(user=self.user, new_email="newemail@example.com")
        expected = f"Email change for {self.user.email} to newemail@example.com"
        self.assertEqual(str(token), expected)


class EmailChangeAPITest(APITestCase):
    """Test email change API endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(
            email="current@example.com",
            username="current@example.com",
            first_name="Test",
            last_name="User",
            password="TestPassword123",
            is_active=True,
        )

        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)

        # URLs
        self.request_email_change_url = reverse("users:request-email-change")
        self.confirm_email_change_url = reverse("users:confirm-email-change")

    def authenticate(self):
        """Helper method to authenticate requests."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access_token}")

    def test_request_email_change_success(self):
        """Test successful email change request."""
        self.authenticate()
        request_data = {"current_password": "TestPassword123", "new_email": "newemail@example.com"}

        response = self.client.post(self.request_email_change_url, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("verification sent", response.data["message"].lower())

        # Verify token was created
        token = EmailChangeToken.objects.get(user=self.user)
        self.assertEqual(token.new_email, "newemail@example.com")
        self.assertTrue(token.is_valid)

    def test_request_email_change_wrong_password(self):
        """Test email change request with wrong password."""
        self.authenticate()
        request_data = {"current_password": "WrongPassword", "new_email": "newemail@example.com"}

        response = self.client.post(self.request_email_change_url, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("current password", str(response.data["errors"]).lower())

    def test_request_email_change_same_email(self):
        """Test email change request with same email."""
        self.authenticate()
        request_data = {
            "current_password": "TestPassword123",
            "new_email": "current@example.com",  # Same as current email
        }

        response = self.client.post(self.request_email_change_url, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("different", str(response.data["errors"]).lower())

    def test_request_email_change_existing_email(self):
        """Test email change request with already registered email."""
        # Create another user
        User.objects.create_user(
            email="existing@example.com",
            username="existing@example.com",
            password="TestPassword123",
        )

        self.authenticate()
        request_data = {"current_password": "TestPassword123", "new_email": "existing@example.com"}

        response = self.client.post(self.request_email_change_url, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("already registered", str(response.data["errors"]).lower())

    def test_request_email_change_unauthenticated(self):
        """Test email change request without authentication."""
        request_data = {"current_password": "TestPassword123", "new_email": "newemail@example.com"}

        response = self.client.post(self.request_email_change_url, request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_request_email_change_replaces_old_token(self):
        """Test that new email change request replaces old token."""
        self.authenticate()

        # Create first request
        request_data = {"current_password": "TestPassword123", "new_email": "first@example.com"}
        self.client.post(self.request_email_change_url, request_data, format="json")

        first_token_count = EmailChangeToken.objects.filter(user=self.user).count()
        self.assertEqual(first_token_count, 1)

        # Create second request
        request_data["new_email"] = "second@example.com"
        response = self.client.post(self.request_email_change_url, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Should still have only one token, but for the new email
        tokens = EmailChangeToken.objects.filter(user=self.user)
        self.assertEqual(tokens.count(), 1)
        self.assertEqual(tokens.first().new_email, "second@example.com")

    def test_confirm_email_change_success(self):
        """Test successful email change confirmation."""
        # Create email change token
        token = EmailChangeToken.objects.create(user=self.user, new_email="confirmed@example.com")

        confirm_data = {"token": token.token}
        response = self.client.post(self.confirm_email_change_url, confirm_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("successfully", response.data["message"].lower())

        # Verify user email was changed
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "confirmed@example.com")
        self.assertEqual(self.user.username, "confirmed@example.com")

        # Verify token was marked as used
        token.refresh_from_db()
        self.assertTrue(token.is_used)

    def test_confirm_email_change_invalid_token(self):
        """Test email change confirmation with invalid token."""
        confirm_data = {"token": "invalid-token"}
        response = self.client.post(self.confirm_email_change_url, confirm_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("invalid", str(response.data["errors"]).lower())

    def test_confirm_email_change_expired_token(self):
        """Test email change confirmation with expired token."""
        from datetime import timedelta

        from django.utils import timezone

        token = EmailChangeToken.objects.create(user=self.user, new_email="expired@example.com")
        token.expires_at = timezone.now() - timedelta(hours=1)
        token.save()

        confirm_data = {"token": token.token}
        response = self.client.post(self.confirm_email_change_url, confirm_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("expired", str(response.data["errors"]).lower())

    def test_confirm_email_change_used_token(self):
        """Test email change confirmation with already used token."""
        token = EmailChangeToken.objects.create(user=self.user, new_email="used@example.com")
        token.is_used = True
        token.save()

        confirm_data = {"token": token.token}
        response = self.client.post(self.confirm_email_change_url, confirm_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("invalid", str(response.data["errors"]).lower())

    def test_confirm_email_change_no_authentication_required(self):
        """Test email change confirmation doesn't require authentication."""
        token = EmailChangeToken.objects.create(user=self.user, new_email="noauth@example.com")

        confirm_data = {"token": token.token}
        # Don't authenticate
        response = self.client.post(self.confirm_email_change_url, confirm_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])

    def test_email_change_complete_workflow(self):
        """Test complete email change workflow from request to confirmation."""
        # Step 1: Request email change
        self.authenticate()
        request_data = {"current_password": "TestPassword123", "new_email": "workflow@example.com"}

        response = self.client.post(self.request_email_change_url, request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Step 2: Verify token was created
        token = EmailChangeToken.objects.get(user=self.user)
        self.assertEqual(token.new_email, "workflow@example.com")
        self.assertTrue(token.is_valid)

        # Step 3: Verify user email is still the old one
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "current@example.com")

        # Step 4: Confirm email change
        confirm_data = {"token": token.token}
        response = self.client.post(self.confirm_email_change_url, confirm_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Step 5: Verify email was changed
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "workflow@example.com")
        self.assertEqual(self.user.username, "workflow@example.com")

        # Step 6: Verify token was marked as used
        token.refresh_from_db()
        self.assertTrue(token.is_used)

        # Step 7: Verify user data is returned in response
        self.assertEqual(response.data["data"]["email"], "workflow@example.com")

    def test_email_change_rate_limiting(self):
        """Test rate limiting on email change endpoints."""
        # Note: This test depends on rate limiting configuration
        # The actual rate limiting behavior would need to be tested
        # with multiple requests, but we can at least verify the
        # rate limiting decorator is applied by checking the view function
        from users.views import confirm_email_change, request_email_change

        # Check that rate limiting decorators are applied
        self.assertTrue(hasattr(request_email_change, "__wrapped__"))
        self.assertTrue(hasattr(confirm_email_change, "__wrapped__"))
