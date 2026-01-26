

export const cleanTable = (table) => {
  return {
    id: table.id,
    name: table.name,
    floorId: table.floor,
    status: table.status,
    countedBills: table.counted_bills ,
    bills: table.bills || [],
    hasOrders: table.has_orders
  }
}
