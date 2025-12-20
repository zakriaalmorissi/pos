from .models import Table, Floor, Order, Bill, TableStatus
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from decimal import Decimal


class SerializeFloor(ModelSerializer):
    class Meta:
        model = Floor
        fields = ['id','name']
        


class SerializeTables(ModelSerializer):
    floor = serializers.PrimaryKeyRelatedField(queryset=Floor.objects.all())# what does this line of code actually do ?
    bills = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    class Meta:
        model = Table
        fields = ['id', 'floor','name', 'status', 'counted_bills', 'has_orders', 'bills']
    
    def get_bills(self, instance: Table):
        bills = instance.bills.all()
        return SerializeBill(bills, many=True).data
    def get_status(self, instance: Table):
        status = instance.status
        return _TableStatusSerializer(status).data

    # when the do the update  and methods  get called
    def create(self, validated_data: dict)-> Table:
            floor: Floor = validated_data.pop('floor', None)# How deos this get turned into a FLoor instance while i'm expecting an integer value ?
            return Table.objects.create(floor=floor, **validated_data) 
            
    def update(self, instance: Table, validated_data: dict)-> Table :
        floor: Floor = validated_data.pop('floor', None)
        if floor:
            instance.floor = floor
            
        instance.name = validated_data.get('name', instance.name)
        instance.save()    
        return instance
    

class _TableStatusSerializer(ModelSerializer):
    table = serializers.PrimaryKeyRelatedField(queryset=Table.objects.all())
    class Meta:
        model = TableStatus
        fields = "__all__"
  
    
    
#
class SerializeBill(ModelSerializer):
    """"
    Return Table and orders inform along with the bill info
    
    """

    orders_length = serializers.SerializerMethodField()
    read_only_discount = serializers.SerializerMethodField()
    final_price = serializers.SerializerMethodField()
 
    class Meta:
        model = Bill
        fields = [

                'id','table', 
                  'name',
                    'orders_length',
                    'is_paid', 'status',
                      'customer_number', 
                      'total',  'tax',
                        'service_charge',
                        'discount',
                        'read_only_discount',
                        'final_price',
                        'created_at',
                      'updated_at',
                      
                ]
        
   
    def get_final_price(self, instance: Bill) ->  Decimal:
        total = Decimal(instance.total)
        discount = total *  Decimal(instance.discount) / 100
        return float(instance.service_charge + total + instance.tax - discount)
        
    
    def get_read_only_discount(self, instance: Bill) -> Decimal:
        total = Decimal(instance.total)
        discount = Decimal(instance.discount)
        return  float(total * discount / 100)
    
    def get_orders_length(self, instance:Bill) -> int: 
        # needs improve performance here 
        return len(instance.orders.all())
        
    
    def create(self, validated_data)-> Bill:

        return Bill.objects.create(**validated_data)
    
    
    def update(self, instance: Bill, validated_data: dict) -> Bill:
        table = validated_data.pop('table', None)
        if table:
            instance.table = table
            
        instance.name = validated_data.get('name', instance.name)
        instance.is_paid = validated_data.get('is_paid', instance.is_paid)
        instance.status = validated_data.get('status', instance.status)
        instance.customer_number = validated_data.get("customer_number", instance.customer_number)
        instance.total = validated_data.get("total", instance.total)
        instance.discount = validated_data.get("discount", instance.discount)
        instance.save()
        return instance
  
    
class DetailedSerializeTable(ModelSerializer):
    floor = serializers.PrimaryKeyRelatedField(queryset=Floor.objects.all())# what does this line of code actually do ?
    bills = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    class Meta: 
        model = Table
        fields = ['id', 'floor','name', 'status', 'counted_bills', 'has_orders', 'bills']


      
    def get_bills(self, instance: Table):
        bills = instance.bills.all()
        return SerializeBill(bills, many=True).data
    
    def get_status(self, instance: Table):
        status = instance.status
        return _TableStatusSerializer(status).data


        

    def create(self, validated_data: dict) -> Table:
        floor = validated_data.pop('floor')
        return Table.objects.create(floor=floor, **validated_data)
    
    
    def update(self, instance: Table, validated_data: dict)-> Table:
        floor = validated_data.pop('floor', None)
        if floor:
            instance.floor = floor
        
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        return instance
        
        
        


class SerializeOrder(ModelSerializer):
    bill = serializers.PrimaryKeyRelatedField(queryset=Bill.objects.all())
    has_table = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [ 
                'id', 'bill', 
                  'food_name','quantity', 'total_price',  'is_ordered',
                  'condiments','price' ,'status', 'created_at',
                  'has_table',
                'updated_at'
            ]
    #  Indicate whether the order in a bill that has table or not 
    def get_has_table(self, instance: Order)-> bool: 
        bill = instance.bill
        return bill.table !=  None
        
    def create(self, validated_data: dict) -> Order:
        bill =  validated_data.pop('bill')
        return Order.objects.create(bill=bill, **validated_data)
        
    
