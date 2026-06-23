from django.urls import path
from .views import (
    RegisterView,
    VerifyEmailView,
    ResendVerificationView,
    LoginView,
    UserListView,
    ForgotPasswordView,
    VerifyResetOTPView,
    ResetPasswordWithOTPView,
    ProfileView,
    AvatarDeleteView,
    ChangePasswordView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", ResendVerificationView.as_view(), name="resend-verification"),
    path("login/", LoginView.as_view(), name="login"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("verify-reset-otp/", VerifyResetOTPView.as_view(), name="verify-reset-otp"),
    path("reset-password/", ResetPasswordWithOTPView.as_view(), name="reset-password"),
]

user_urlpatterns = [
    path("list/", UserListView.as_view(), name="user-list"),
    path("profile/", ProfileView.as_view(), name="user-profile"),
    path("profile/avatar/", AvatarDeleteView.as_view(), name="avatar-delete"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
