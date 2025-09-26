from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Category, ParentItems, ChildItems,Condiments



class SerializeCategory(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class SerializeMenu(serializers.ModelSerializer):
    parent_items = serializers.SerializerMethodField()
    class Meta:
        model = Category
        fields = ["id", "name", "parent_items"]

    def get_parent_items(self, obj): 
        items = obj.items.all()
        return SerializeParentItems(items, many=True).data

  


class SerializeParentItems(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    name = serializers.CharField(max_length=20, validators = [
        UniqueValidator(
            queryset=ParentItems.objects.all(),
            message= "Name already exists. Please enter a new name"
        ),
    ])

    child_items = serializers.SerializerMethodField()

    class Meta:
        model = ParentItems
        fields = ['id', 'category', 'name', 'color', "child_items"]


    def create(self, validated_data):
        category = validated_data.pop('category')
        parent_item = ParentItems.objects.create(category=category, **validated_data)
        return parent_item

    def update(self, instance: ParentItems, validated_data: dict) -> ParentItems:
        category = validated_data.pop('category', None)
        if category:
            instance.category = category
        instance.name = validated_data.get('name', instance.name)
        instance.color = validated_data.get('color', instance.color)
        
        instance.save()
        return instance

    def get_child_items(self, obj: ParentItems) -> list:
        items = obj.items.all()
        return SerializeChildItems(items, many=True).data

    
    
    
class SerializeChildItems(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=ParentItems.objects.all())
    name = serializers.CharField(max_length=25, validators= [
        UniqueValidator(
            queryset= ChildItems.objects.all(),
            message = "Name already exists. Please enter a new name" 
            
        ),
        
    ])
    
    children = serializers.SerializerMethodField()
    class Meta:
        model = ChildItems
        fields = ['id', 'category','name', 'parent', 'price', 'children']


    def get_children(self, obj):
        children = obj.children.all()
        if children.exists(): 
            return SerializeChildItems(children, many=True).data
        return None
    
        
    def create(self, validated_data: dict)-> ChildItems:
        parent_item = validated_data.pop('category', None)
        child_item = ChildItems.objects.create(category=parent_item, **validated_data)
        return child_item

    def update(self, instance: ChildItems, validated_data: dict) -> ChildItems:
        category = validated_data.pop('category', None)
        if category:
            instance.category = category
        instance.name = validated_data.get('name', instance.name)
        instance.parent = validated_data.get("parent", instance.parent)
        instance.price = validated_data.get('price', instance.price)
        instance.save()
        return instance
            
        
class SerializeCondiments(serializers.ModelSerializer):
    item = serializers.PrimaryKeyRelatedField(queryset=ChildItems.objects.all())
    class Meta:
        model = Condiments
        fields = ['id','item', 'name']
        
        
    



class DetailedSerializeItems(serializers.ModelSerializer):
    category = SerializeCategory(read_only=True)
    class Meta:
        model = ParentItems
        fields = "__all__"
        


class DetailSerializeChildItems(serializers.ModelSerializer):
    category = DetailedSerializeItems(read_only=True)

    children = serializers.SerializerMethodField()
    class Meta:
        model = ChildItems
        fields = ['id', 'category','name', 'parent', 'price', 'children']

    
    def get_children(self, obj):
        children = obj.children.all()
        if children.exists(): 
            return DetailSerializeChildItems(children, many=True).data
        return None