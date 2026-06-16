from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated



# Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


# Register View
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


# Login View
class LoginView(APIView):

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")


        user = authenticate(
            username=username,
            password=password
        )

        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)


        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })
    

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class UserListView(
    generics.ListAPIView
):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
