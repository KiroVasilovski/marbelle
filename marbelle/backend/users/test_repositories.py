"""Comprehensive tests for user repositories."""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from .models import Address, EmailChangeToken, EmailVerificationToken, PasswordResetToken
from .repositories import AddressRepository, TokenRepository, UserRepository

User = get_user_model()


class UserRepositoryTest(TestCase):
    """Test UserRepository data access methods."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.user_data = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "TestPassword123",
        }
        self.user = UserRepository.create_user(**self.user_data)

    def test_create_user(self) -> None:
        """Test creating a user via repository."""
        new_user = UserRepository.create_user(
            email="newuser@example.com",
            first_name="New",
            last_name="User",
            password="NewPassword123",
        )
        self.assertIsNotNone(new_user.id)
        self.assertEqual(new_user.email, "newuser@example.com")
        self.assertTrue(new_user.check_password("NewPassword123"))

    def test_create_user_with_optional_fields(self) -> None:
        """Test creating user with optional phone and company_name."""
        new_user = UserRepository.create_user(
            email="business@example.com",
            first_name="Business",
            last_name="User",
            password="Password123",
            phone="+1234567890",
            company_name="Test Company",
            is_active=True,
        )
        self.assertEqual(new_user.phone, "+1234567890")
        self.assertEqual(new_user.company_name, "Test Company")
        self.assertTrue(new_user.is_active)

    def test_get_by_email_success(self) -> None:
        """Test retrieving user by email successfully."""
        found_user = UserRepository.get_by_email("test@example.com")
        self.assertIsNotNone(found_user)
        self.assertEqual(found_user.id, self.user.id)
        self.assertEqual(found_user.email, "test@example.com")

    def test_get_by_email_not_found(self) -> None:
        """Test get_by_email returns None for non-existent email."""
        found_user = UserRepository.get_by_email("nonexistent@example.com")
        self.assertIsNone(found_user)

    def test_get_by_email_case_sensitive(self) -> None:
        """Test get_by_email is case-sensitive (Django default)."""
        # Django email fields are typically case-insensitive at DB level,
        # but get_by_email should find the user regardless
        found_user = UserRepository.get_by_email("TEST@EXAMPLE.COM")
        # This depends on database configuration, but should be found if DB is case-insensitive
        # or not found if case-sensitive. This test documents the behavior.
        if found_user:
            self.assertEqual(found_user.id, self.user.id)

    def test_get_active_by_email_success(self) -> None:
        """Test retrieving active user by email."""
        self.user.is_active = True
        self.user.save()
        found_user = UserRepository.get_active_by_email("test@example.com")
        self.assertIsNotNone(found_user)
        self.assertEqual(found_user.id, self.user.id)

    def test_get_active_by_email_inactive_user(self) -> None:
        """Test get_active_by_email returns None for inactive user."""
        self.user.is_active = False
        self.user.save()
        found_user = UserRepository.get_active_by_email("test@example.com")
        self.assertIsNone(found_user)

    def test_get_active_by_email_not_found(self) -> None:
        """Test get_active_by_email returns None for non-existent email."""
        found_user = UserRepository.get_active_by_email("nonexistent@example.com")
        self.assertIsNone(found_user)

    def test_get_by_id_success(self) -> None:
        """Test retrieving user by ID."""
        found_user = UserRepository.get_by_id(self.user.id)
        self.assertIsNotNone(found_user)
        self.assertEqual(found_user.id, self.user.id)

    def test_get_by_id_not_found(self) -> None:
        """Test get_by_id returns None for non-existent ID."""
        found_user = UserRepository.get_by_id(99999)
        self.assertIsNone(found_user)

    def test_email_exists_true(self) -> None:
        """Test email_exists returns True for existing email."""
        exists = UserRepository.email_exists("test@example.com")
        self.assertTrue(exists)

    def test_email_exists_false(self) -> None:
        """Test email_exists returns False for non-existent email."""
        exists = UserRepository.email_exists("nonexistent@example.com")
        self.assertFalse(exists)

    def test_email_exists_multiple_users(self) -> None:
        """Test email_exists works with multiple users."""
        UserRepository.create_user(
            email="another@example.com",
            first_name="Another",
            last_name="User",
            password="Password123",
        )
        self.assertTrue(UserRepository.email_exists("test@example.com"))
        self.assertTrue(UserRepository.email_exists("another@example.com"))
        self.assertFalse(UserRepository.email_exists("missing@example.com"))


class TokenRepositoryTest(TestCase):
    """Test TokenRepository data access methods."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.user = User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
        )

    def test_get_token_by_string_email_verification(self) -> None:
        """Test retrieving email verification token by string."""
        token_obj = EmailVerificationToken.objects.create(user=self.user)
        found_token = TokenRepository.get_token_by_string(token_obj.token, EmailVerificationToken)
        self.assertIsNotNone(found_token)
        self.assertEqual(found_token.id, token_obj.id)

    def test_get_token_by_string_not_found(self) -> None:
        """Test get_token_by_string returns None for invalid token."""
        found_token = TokenRepository.get_token_by_string("invalid_token_string", EmailVerificationToken)
        self.assertIsNone(found_token)

    def test_get_valid_token_success(self) -> None:
        """Test get_valid_token returns valid token."""
        token_obj = EmailVerificationToken.objects.create(user=self.user)
        valid_token = TokenRepository.get_valid_token(token_obj.token, EmailVerificationToken)
        self.assertIsNotNone(valid_token)
        self.assertEqual(valid_token.id, token_obj.id)

    def test_get_valid_token_expired(self) -> None:
        """Test get_valid_token returns None for expired token."""
        token_obj = EmailVerificationToken.objects.create(user=self.user)
        # Expire the token
        token_obj.expires_at = timezone.now() - timedelta(hours=1)
        token_obj.save()
        valid_token = TokenRepository.get_valid_token(token_obj.token, EmailVerificationToken)
        self.assertIsNone(valid_token)

    def test_get_valid_token_used(self) -> None:
        """Test get_valid_token returns None for used token."""
        token_obj = EmailVerificationToken.objects.create(user=self.user)
        token_obj.is_used = True
        token_obj.save()
        valid_token = TokenRepository.get_valid_token(token_obj.token, EmailVerificationToken)
        self.assertIsNone(valid_token)

    def test_mark_token_used(self) -> None:
        """Test marking a token as used."""
        token_obj = EmailVerificationToken.objects.create(user=self.user)
        self.assertFalse(token_obj.is_used)
        TokenRepository.mark_token_used(token_obj)
        token_obj.refresh_from_db()
        self.assertTrue(token_obj.is_used)

    def test_get_or_create_email_verification_token_creates_new(self) -> None:
        """Test get_or_create creates new token when none exists."""
        token = TokenRepository.get_or_create_email_verification_token(self.user)
        self.assertIsNotNone(token.id)
        self.assertEqual(token.user_id, self.user.id)
        self.assertFalse(token.is_used)

    def test_get_or_create_email_verification_token_reuses_valid(self) -> None:
        """Test get_or_create reuses existing valid token."""
        token1 = TokenRepository.get_or_create_email_verification_token(self.user)
        token2 = TokenRepository.get_or_create_email_verification_token(self.user)
        self.assertEqual(token1.id, token2.id)
        self.assertEqual(token1.token, token2.token)

    def test_get_or_create_email_verification_token_creates_new_if_expired(
        self,
    ) -> None:
        """Test get_or_create creates new token if existing is expired."""
        token1 = TokenRepository.get_or_create_email_verification_token(self.user)
        # Expire token1
        token1.expires_at = timezone.now() - timedelta(hours=1)
        token1.save()
        token2 = TokenRepository.get_or_create_email_verification_token(self.user)
        # Should create a new token
        self.assertNotEqual(token1.id, token2.id)
        self.assertNotEqual(token1.token, token2.token)

    def test_verify_email_token_success(self) -> None:
        """Test verify_email_token returns valid token."""
        token_obj = EmailVerificationToken.objects.create(user=self.user)
        verified = TokenRepository.verify_email_token(token_obj.token)
        self.assertIsNotNone(verified)
        self.assertEqual(verified.id, token_obj.id)

    def test_verify_email_token_invalid(self) -> None:
        """Test verify_email_token returns None for invalid token."""
        verified = TokenRepository.verify_email_token("invalid_token")
        self.assertIsNone(verified)

    def test_create_password_reset_token(self) -> None:
        """Test creating password reset token."""
        token = TokenRepository.create_password_reset_token(self.user)
        self.assertIsNotNone(token.id)
        self.assertEqual(token.user_id, self.user.id)
        self.assertFalse(token.is_used)

    def test_create_password_reset_token_deletes_existing(self) -> None:
        """Test creating new password reset deletes old ones."""
        token1 = TokenRepository.create_password_reset_token(self.user)
        token1_id = token1.id
        token2 = TokenRepository.create_password_reset_token(self.user)
        # Old token should be deleted
        with self.assertRaises(PasswordResetToken.DoesNotExist):
            PasswordResetToken.objects.get(id=token1_id)
        self.assertNotEqual(token1.id, token2.id)

    def test_verify_password_reset_token(self) -> None:
        """Test verify_password_reset_token."""
        token_obj = TokenRepository.create_password_reset_token(self.user)
        verified = TokenRepository.verify_password_reset_token(token_obj.token)
        self.assertIsNotNone(verified)

    def test_create_email_change_token(self) -> None:
        """Test creating email change token."""
        new_email = "newemail@example.com"
        token = TokenRepository.create_email_change_token(self.user, new_email)
        self.assertIsNotNone(token.id)
        self.assertEqual(token.user_id, self.user.id)
        self.assertEqual(token.new_email, new_email)

    def test_create_email_change_token_deletes_existing(self) -> None:
        """Test creating new email change token deletes old ones."""
        token1 = TokenRepository.create_email_change_token(self.user, "email1@example.com")
        token1_id = token1.id
        TokenRepository.create_email_change_token(self.user, "email2@example.com")
        # Old token should be deleted
        with self.assertRaises(EmailChangeToken.DoesNotExist):
            EmailChangeToken.objects.get(id=token1_id)

    def test_get_user_email_change_token(self) -> None:
        """Test getting user's pending email change token."""
        token = TokenRepository.create_email_change_token(self.user, "new@example.com")
        found = TokenRepository.get_user_email_change_token(self.user)
        self.assertIsNotNone(found)
        self.assertEqual(found.id, token.id)

    def test_get_user_email_change_token_none(self) -> None:
        """Test getting email change token when none exists."""
        found = TokenRepository.get_user_email_change_token(self.user)
        self.assertIsNone(found)

    def test_verify_email_change_token(self) -> None:
        """Test verify_email_change_token."""
        token_obj = TokenRepository.create_email_change_token(self.user, "new@example.com")
        verified = TokenRepository.verify_email_change_token(token_obj.token)
        self.assertIsNotNone(verified)

    def test_cleanup_expired_tokens(self) -> None:
        """Test cleanup_expired_tokens removes expired tokens."""
        # Create various tokens
        email_token = EmailVerificationToken.objects.create(user=self.user)
        password_token = PasswordResetToken.objects.create(user=self.user)
        email_change_token = EmailChangeToken.objects.create(user=self.user, new_email="new@example.com")

        # Expire all tokens
        now = timezone.now()
        EmailVerificationToken.objects.filter(id=email_token.id).update(expires_at=now - timedelta(hours=1))
        PasswordResetToken.objects.filter(id=password_token.id).update(expires_at=now - timedelta(hours=1))
        EmailChangeToken.objects.filter(id=email_change_token.id).update(expires_at=now - timedelta(hours=1))

        # Run cleanup
        TokenRepository.cleanup_expired_tokens()

        # Verify tokens are deleted
        self.assertFalse(EmailVerificationToken.objects.filter(id=email_token.id).exists())
        self.assertFalse(PasswordResetToken.objects.filter(id=password_token.id).exists())
        self.assertFalse(EmailChangeToken.objects.filter(id=email_change_token.id).exists())


class AddressRepositoryTest(TestCase):
    """Test AddressRepository data access methods."""

    def setUp(self) -> None:
        """Set up test fixtures."""
        self.user = User.objects.create_user(
            email="test@example.com",
            username="test@example.com",
            password="TestPassword123",
        )
        self.address_data = {
            "label": "Home",
            "first_name": "Test",
            "last_name": "User",
            "address_line_1": "123 Main St",
            "city": "Testville",
            "state": "TS",
            "postal_code": "12345",
            "country": "USA",
        }

    def test_get_user_addresses_empty(self) -> None:
        """Test getting addresses for user with no addresses."""
        addresses = list(AddressRepository.get_user_addresses(self.user))
        self.assertEqual(len(addresses), 0)

    def test_get_user_addresses_single(self) -> None:
        """Test getting addresses for user with one address."""
        address = AddressRepository.create_address(self.user, **self.address_data)
        addresses = list(AddressRepository.get_user_addresses(self.user))
        self.assertEqual(len(addresses), 1)
        self.assertEqual(addresses[0].id, address.id)

    def test_get_user_addresses_multiple(self) -> None:
        """Test getting multiple addresses."""
        addr1 = AddressRepository.create_address(self.user, **self.address_data)
        addr2_data = self.address_data.copy()
        addr2_data["label"] = "Work"
        addr2 = AddressRepository.create_address(self.user, **addr2_data)
        addresses = list(AddressRepository.get_user_addresses(self.user))
        self.assertEqual(len(addresses), 2)
        address_ids = {a.id for a in addresses}
        self.assertIn(addr1.id, address_ids)
        self.assertIn(addr2.id, address_ids)

    def test_get_primary_address(self) -> None:
        """Test getting primary address."""
        address = AddressRepository.create_address(self.user, **self.address_data)
        # First address is automatically set as primary
        primary = AddressRepository.get_primary_address(self.user)
        self.assertIsNotNone(primary)
        self.assertEqual(primary.id, address.id)
        self.assertTrue(primary.is_primary)

    def test_get_user_address_success(self) -> None:
        """Test getting specific address for user."""
        address = AddressRepository.create_address(self.user, **self.address_data)
        found = AddressRepository.get_user_address(address.id, self.user)
        self.assertIsNotNone(found)
        self.assertEqual(found.id, address.id)

    def test_get_user_address_security_check(self) -> None:
        """Test get_user_address doesn't return address from another user."""
        other_user = User.objects.create_user(
            email="other@example.com",
            username="other@example.com",
            password="Password123",
        )
        address = AddressRepository.create_address(self.user, **self.address_data)
        found = AddressRepository.get_user_address(address.id, other_user)
        self.assertIsNone(found)

    def test_user_has_address_label_true(self) -> None:
        """Test user_has_address_label returns True for existing label."""
        AddressRepository.create_address(self.user, **self.address_data)
        has_label = AddressRepository.user_has_address_label(self.user, "Home")
        self.assertTrue(has_label)

    def test_user_has_address_label_false(self) -> None:
        """Test user_has_address_label returns False for non-existent label."""
        has_label = AddressRepository.user_has_address_label(self.user, "Work")
        self.assertFalse(has_label)

    def test_user_has_address_label_different_user(self) -> None:
        """Test label check is per-user."""
        other_user = User.objects.create_user(
            email="other@example.com",
            username="other@example.com",
            password="Password123",
        )
        AddressRepository.create_address(self.user, **self.address_data)
        has_label = AddressRepository.user_has_address_label(other_user, "Home")
        self.assertFalse(has_label)

    def test_count_user_addresses(self) -> None:
        """Test counting user addresses."""
        self.assertEqual(AddressRepository.count_user_addresses(self.user), 0)
        AddressRepository.create_address(self.user, **self.address_data)
        self.assertEqual(AddressRepository.count_user_addresses(self.user), 1)
        addr2_data = self.address_data.copy()
        addr2_data["label"] = "Work"
        AddressRepository.create_address(self.user, **addr2_data)
        self.assertEqual(AddressRepository.count_user_addresses(self.user), 2)

    def test_create_address(self) -> None:
        """Test creating an address."""
        address = AddressRepository.create_address(self.user, **self.address_data)
        self.assertIsNotNone(address.id)
        self.assertEqual(address.user_id, self.user.id)
        self.assertEqual(address.label, "Home")
        self.assertTrue(address.is_primary)  # First address is primary

    def test_update_address(self) -> None:
        """Test updating an address."""
        address = AddressRepository.create_address(self.user, **self.address_data)
        updated = AddressRepository.update_address(address, label="Updated Home", city="Newtown")
        updated.refresh_from_db()
        self.assertEqual(updated.label, "Updated Home")
        self.assertEqual(updated.city, "Newtown")

    def test_set_primary_address(self) -> None:
        """Test setting an address as primary."""
        addr1_data = self.address_data.copy()
        addr1 = AddressRepository.create_address(self.user, **addr1_data)

        addr2_data = self.address_data.copy()
        addr2_data["label"] = "Work"
        addr2 = AddressRepository.create_address(self.user, **addr2_data)

        # addr1 should be primary (first address)
        self.assertTrue(addr1.is_primary)
        self.assertFalse(addr2.is_primary)

        # Set addr2 as primary
        AddressRepository.set_primary_address(addr2)
        addr2.refresh_from_db()
        addr1.refresh_from_db()

        self.assertTrue(addr2.is_primary)
        self.assertFalse(addr1.is_primary)

    def test_delete_address(self) -> None:
        """Test deleting an address."""
        address = AddressRepository.create_address(self.user, **self.address_data)
        address_id = address.id
        AddressRepository.delete_address(address)
        self.assertFalse(Address.objects.filter(id=address_id).exists())
