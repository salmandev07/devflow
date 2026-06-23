import secrets
from datetime import timedelta

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    avatar = models.FileField(
        upload_to="avatars/",
        blank=True,
        null=True
    )
    full_name = models.CharField(
        max_length=150,
        blank=True,
        default=""
    )
    position = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    def __str__(self):
        return f"Profile of {self.user.username}"

    @property
    def display_name(self):
        return self.full_name or self.user.username


class EmailVerification(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="email_verifications"
    )
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Verification for {self.user.email}"

    @classmethod
    def generate(cls, user, expiry_minutes=15):
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        otp = f"{secrets.randbelow(1000000):06d}"
        return cls.objects.create(
            user=user,
            otp=otp,
            expires_at=timezone.now() + timedelta(minutes=expiry_minutes),
        )

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at


class PasswordResetOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Reset OTP for {self.email}"

    @classmethod
    def generate(cls, email, expiry_minutes=10):
        cls.objects.filter(email=email, is_used=False).update(is_used=True)
        otp = f"{secrets.randbelow(1000000):06d}"
        return cls.objects.create(
            email=email,
            otp=otp,
            expires_at=timezone.now() + timedelta(minutes=expiry_minutes),
        )

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at
