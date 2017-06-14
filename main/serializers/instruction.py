from rest_framework import serializers
from main.models import PageVideoInstruction


class PageIdField(serializers.Field):
    def to_representation(self, page_video_instruction):
        return page_video_instruction.get_page_name()

    def get_attribute(self, page_id):
        return page_id

    def to_internal_value(self, page_id):
        return page_id


class PageVideoInstructionSerializer(serializers.ModelSerializer):
    page_id = PageIdField(read_only=True)

    class Meta:
        model = PageVideoInstruction
        fields = ('id', 'page_id', 'youtube_video_id')
