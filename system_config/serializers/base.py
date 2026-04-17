from system_config.models import *
from rest_framework import serializers


class BaseBusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = "__all__"
      



class ReadOnlyBusinessSerializer(BaseBusinessSerializer):
    class Meta(BaseBusinessSerializer.Meta):
        read_only_fields = BaseBusinessSerializer.Meta.fields

class WritableBusinessSerializer(BaseBusinessSerializer):
    class Meta(BaseBusinessSerializer.Meta):
        read_only_fields = ["id", "owner", "business_type"]



class SuperAdminBusinessSerializer(BaseBusinessSerializer):
    class Meta(BaseBusinessSerializer.Meta):
        read_only_fields = ["id"]