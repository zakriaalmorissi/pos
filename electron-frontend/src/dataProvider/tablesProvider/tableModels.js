
export const cleanTable = (table) => {
  return {
    id: table.id,
    name: table.name,
    floorId: table.group,
    status: table.status,
    countedBills: table.counted_orders ,
    bills: table.orders || [],
    hasOrders: table.has_orders,
    selected: false,
  }
}