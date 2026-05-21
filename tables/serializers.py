from .models import Table, TablesGroup, Order, Bill, TableStatus
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from decimal import Decimal


class Serializegroup(ModelSerializer):
    tables = serializers.SerializerMethodField()
    class Meta:
        model = group
        fields = ['id','name', 'tables']

    def get_tables(self, obj: group) -> list: 
        tables = obj.tables.all()
        return SerializeTables(tables, many=True).data

        


class SerializeTables(ModelSerializer):
    group = serializers.PrimaryKeyRelatedField(queryset=TablesGroup.objects.all())# what does this line of code actually do ?
    bills = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    class Meta:
        model = Table
        fields = ['id', 'group','name', 'status', 'counted_bills', 'has_orders', 'bills']
    
    def get_bills(self, instance: Table):
        bills = instance.bills.all()
        return SerializeBill(bills, many=True).data
    def get_status(self, instance: Table):
        status = instance.status
        return _TableStatusSerializer(status).data

    # when the do the update  and methods  get called
    def create(self, validated_data: dict)-> Table:
            group: group = validated_data.pop('group', None)# How deos this get turned into a group instance while i'm expecting an integer value ?
            return Table.objects.create(group=group, **validated_data) 
            
    def update(self, instance: Table, validated_data: dict)-> Table :
        group: group = validated_data.pop('group', None)
        if group:
            instance.group = group
            
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
        orders:list = instance.orders.all()
        length: int = 0
        for order in orders: 
            length += order.quantity 
        return length
        
    
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
    group = serializers.PrimaryKeyRelatedField(queryset=group.objects.all())# what does this line of code actually do ?
    bills = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    class Meta: 
        model = Table
        fields = ['id', 'group','name', 'status', 'counted_bills', 'has_orders', 'bills']


      
    def get_bills(self, instance: Table):
        bills = instance.bills.all()
        return SerializeBill(bills, many=True).data
    
    def get_status(self, instance: Table):
        status = instance.status
        return _TableStatusSerializer(status).data


        

    def create(self, validated_data: dict) -> Table:
        group = validated_data.pop('group')
        return Table.objects.create(group=group, **validated_data)
    
    
    def update(self, instance: Table, validated_data: dict)-> Table:
        group = validated_data.pop('group', None)
        if group:
            instance.group = group
        
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
                  'name','quantity', 'total_price',  'is_ordered',
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
        
    
