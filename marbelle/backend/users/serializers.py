from typing import Any, Dict

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Address, EmailChangeToken, EmailVerificationToken, PasswordResetToken, User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "company_name", "phone", "password", "password_confirm"]

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data: Dict[str, Any]) -> User:
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        # Create user with inactive status
        user = User.objects.create_user(
            username=validated_data["email"],  # Use email as username
            is_active=False,  # Account remains inactive until email verification
            **validated_data,
        )
        user.set_password(password)
        user.save()

        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            # Check if user exists and is active
            try:
                user = User.objects.get(email=email)
                if not user.is_active:
                    raise serializers.ValidationError(
                        "Account is not activated. Please check your email for verification instructions."
                    )
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")

            # Authenticate user
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid email or password.")

            # Update last_login field
            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])

            attrs["user"] = user
        else:
            raise serializers.ValidationError("Email and password are required.")

        return attrs


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user information (without sensitive data).
    """

    is_business_customer = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "company_name", "phone", "is_business_customer"]
        read_only_fields = ["id"]


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification.
    """

    token = serializers.CharField()

    def validate_token(self, value: str) -> EmailVerificationToken:
        try:
            verification_token = EmailVerificationToken.objects.get(token=value)
            if not verification_token.is_valid:
                raise serializers.ValidationError("Invalid or expired verification token.")
            return verification_token
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError("Invalid verification token.")


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation.
    """

    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        return attrs

    def validate_token(self, value: str) -> PasswordResetToken:
        try:
            reset_token = PasswordResetToken.objects.get(token=value)
            if not reset_token.is_valid:
                raise serializers.ValidationError("Invalid or expired reset token.")
            return reset_token
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid reset token.")


class TokenSerializer(serializers.Serializer):
    """
    Serializer for JWT token response.
    """

    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()

    @classmethod
    def get_token_for_user(cls, user: User) -> Dict[str, Any]:
        """
        Generate JWT tokens for user.
        """
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile management.
    """

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "phone", "company_name"]
        extra_kwargs = {
            "email": {"validators": []},  # Remove built-in validators for email
        }

    def validate_email(self, value: str) -> str:
        """
        Validate email format but allow duplicate emails for security.

        Always returns the email as valid to prevent email enumeration attacks.
        The frontend should inform users that if the email is already registered,
        the change will be silently ignored for security reasons.
        """
        return value

    def update(self, instance: User, validated_data: Dict[str, Any]) -> User:
        """
        Update user profile with email change handling.

        Silently ignores email changes if the new email already exists
        to prevent email enumeration attacks.
        """
        # Check if email is being changed and if it already exists
        if "email" in validated_data and instance.email != validated_data["email"]:
            new_email = validated_data["email"]
            if User.objects.filter(email=new_email).exists():
                # Silently ignore the email change for security
                validated_data.pop("email")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        try:
            instance.save()
        except Exception:
            # If there's still a database constraint error (edge case),
            # silently ignore it for security reasons
            pass

        return instance


class AddressSerializer(serializers.ModelSerializer):
    """
    Serializer for address management.
    """

    class Meta:
        model = Address
        fields = [
            "id",
            "label",
            "first_name",
            "last_name",
            "company",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "postal_code",
            "country",
            "phone",
            "is_primary",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_label(self, value: str) -> str:
        """
        Validate address label uniqueness per user.
        """
        user = self.context["request"].user
        address_id = self.instance.id if self.instance else None

        existing = Address.objects.filter(user=user, label=value)
        if address_id:
            existing = existing.exclude(id=address_id)

        if existing.exists():
            raise serializers.ValidationError("An address with this label already exists.")
        return value

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate address count limit.
        """
        user = self.context["request"].user

        # Check address count limit for new addresses
        if not self.instance and Address.objects.filter(user=user).count() >= 10:
            raise serializers.ValidationError("Maximum 10 addresses allowed per user.")

        return attrs

    def create(self, validated_data: Dict[str, Any]) -> Address:
        """
        Create address with user assignment.
        """
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change.
    """

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate_current_password(self, value: str) -> str:
        """
        Validate current password.
        """
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate password confirmation.
        """
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        return attrs

    def save(self) -> None:
        """
        Save new password.
        """
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()


class EmailChangeRequestSerializer(serializers.Serializer):
    """
    Serializer for email change request.
    Industry-standard approach: requires current password + new email.
    """

    current_password = serializers.CharField(write_only=True)
    new_email = serializers.EmailField()

    def validate_current_password(self, value: str) -> str:
        """
        Validate current password for re-authentication.
        """
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_email(self, value: str) -> str:
        """
        Validate new email address.
        """
        user = self.context["request"].user

        # Check if new email is same as current
        if user.email.lower() == value.lower():
            raise serializers.ValidationError("New email must be different from current email.")

        # Check if new email already exists in the system
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email address is already registered.")

        return value.lower()

    def save(self) -> EmailChangeToken:
        """
        Create email change token.
        """
        user = self.context["request"].user
        new_email = self.validated_data["new_email"]

        # Delete any existing email change tokens for this user
        EmailChangeToken.objects.filter(user=user).delete()

        # Create new email change token
        email_change_token = EmailChangeToken.objects.create(user=user, new_email=new_email)

        return email_change_token


class EmailChangeConfirmSerializer(serializers.Serializer):
    """
    Serializer for email change confirmation.
    """

    token = serializers.CharField()

    def validate_token(self, value: str) -> EmailChangeToken:
        """
        Validate email change token.
        """
        try:
            email_change_token = EmailChangeToken.objects.get(token=value)
            if not email_change_token.is_valid:
                raise serializers.ValidationError("Invalid or expired email change token.")
            return email_change_token
        except EmailChangeToken.DoesNotExist:
            raise serializers.ValidationError("Invalid email change token.")

    def save(self) -> Dict[str, Any]:
        """
        Confirm email change and update user email.
        Returns both user and old email for notification purposes.
        """
        email_change_token = self.validated_data["token"]
        user = email_change_token.user
        old_email = user.email

        # Update user email
        user.email = email_change_token.new_email
        user.username = email_change_token.new_email  # Keep username in sync
        user.save()

        # Mark token as used
        email_change_token.is_used = True
        email_change_token.save()

        return {"user": user, "old_email": old_email, "new_email": email_change_token.new_email}
