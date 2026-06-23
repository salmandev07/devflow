from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings

from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import AnonRateThrottle

from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile, EmailVerification, PasswordResetOTP
from .serializers import UserSerializer, UserProfileSerializer, UpdateProfileSerializer, ChangePasswordSerializer


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            is_active=True,
        )
        verification = EmailVerification.generate(user)
        send_mail(
            subject="DevFlow — Verify your email",
            message=(
                f"Your verification code is: {verification.otp}\n\n"
                f"This code expires in 15 minutes.\n\n"
                f"If you didn't create an account, ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return user


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = []
    throttle_classes = [AnonRateThrottle]


class VerifyEmailView(APIView):
    permission_classes = []
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        username = request.data.get("username")
        otp = request.data.get("otp")

        if not username or not otp:
            return Response(
                {"detail": "Username and OTP are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid username"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification = (
            EmailVerification.objects
            .filter(user=user, otp=otp, is_used=False)
            .order_by("-created_at")
            .first()
        )

        if not verification or not verification.is_valid():
            return Response(
                {"detail": "Invalid or expired OTP"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification.is_used = True
        verification.save()

        return Response(
            {"detail": "Email verified successfully"},
            status=status.HTTP_200_OK,
        )


class ResendVerificationView(APIView):
    permission_classes = []
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        username = request.data.get("username")
        if not username:
            return Response(
                {"detail": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid username"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification = EmailVerification.generate(user)
        send_mail(
            subject="DevFlow — Verify your email",
            message=(
                f"Your verification code is: {verification.otp}\n\n"
                f"This code expires in 15 minutes.\n\n"
                f"If you didn't create an account, ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {"detail": "Verification code sent"},
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    permission_classes = []
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if user.is_superuser:
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_superuser": user.is_superuser,
                "username": user.username,
            })

        has_verified = EmailVerification.objects.filter(
            user=user, is_used=True
        ).exists()

        if not has_verified:
            verification = EmailVerification.generate(user)
            send_mail(
                subject="DevFlow — Verify your email",
                message=(
                    f"Your verification code is: {verification.otp}\n\n"
                    f"This code expires in 15 minutes.\n\n"
                    f"If you didn't create an account, ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            return Response(
                {
                    "error": "Email not verified",
                    "requires_verification": True,
                    "username": user.username,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "is_superuser": user.is_superuser,
            "username": user.username,
        })


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = User.objects.filter(is_active=True, is_superuser=False)

        exclude_team = self.request.query_params.get("exclude_team")
        if exclude_team:
            qs = qs.exclude(
                id__in=User.objects.filter(
                    teams__id=exclude_team
                ).values("id")
            )

        return qs.order_by("username")


class ForgotPasswordView(APIView):
    permission_classes = []
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"detail": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not User.objects.filter(email=email).exists():
            return Response(
                {"detail": "If an account exists with this email, a verification code has been sent."},
                status=status.HTTP_200_OK,
            )

        reset_otp = PasswordResetOTP.generate(email)
        send_mail(
            subject="DevFlow — Password Reset Code",
            message=(
                f"Your password reset code is: {reset_otp.otp}\n\n"
                f"This code expires in 10 minutes.\n\n"
                f"If you didn't request this, ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {"detail": "If an account exists with this email, a verification code has been sent."},
            status=status.HTTP_200_OK,
        )


class VerifyResetOTPView(APIView):
    permission_classes = []
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response(
                {"detail": "Email and OTP are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reset_otp = (
            PasswordResetOTP.objects
            .filter(email=email, otp=otp, is_used=False)
            .order_by("-created_at")
            .first()
        )

        if not reset_otp or not reset_otp.is_valid():
            return Response(
                {"detail": "Invalid or expired OTP"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reset_otp.is_used = True
        reset_otp.save()

        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes
        user = User.objects.get(email=email)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        return Response(
            {"detail": "OTP verified", "uid": uid},
            status=status.HTTP_200_OK,
        )


class ResetPasswordWithOTPView(APIView):
    permission_classes = []
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        uid = request.data.get("uid")
        password = request.data.get("password")

        if not uid or not password:
            return Response(
                {"detail": "UID and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from django.utils.http import urlsafe_base64_decode
            from django.utils.encoding import force_str
            user_pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_pk)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Invalid request"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save()

        return Response(
            {"detail": "Password reset successfully"},
            status=status.HTTP_200_OK,
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = UpdateProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserProfileSerializer(profile, context={"request": request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AvatarDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        if profile.avatar:
            profile.avatar.delete(save=False)
            profile.avatar = None
            profile.save()
        return Response(UserProfileSerializer(profile, context={"request": request}).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data["new_password"])
            request.user.save()
            return Response({"detail": "Password changed successfully"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
