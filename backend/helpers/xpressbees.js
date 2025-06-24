// services/xpressbees.js
import axios from "axios";

export async function createXpressBeesOrder(order) {
  try {
    console.log("Creating XpressBees order for:", order._id);
    console.log("Order tota:", order);

    const data = createShipmentData(order);
    // const data = {
    //   order_number: "ORDER123",
    //   unique_order_number: "yes",
    //   shipping_charges: 0,
    //   cod_charges: 0,
    //   payment_type: "cod",
    //   order_amount: 499,
    //   package_weight: 500,
    //   package_type: 1,
    //   package_breadth: 10,
    //   package_height: 10,
    //   request_auto_pickup: "yes",
    //   consignee: {
    //     name: "Mukki Pandit",
    //     address: "123 Street",
    //     city: "Pune",
    //     state: "Maharashtra",
    //     pincode: "411001",
    //     phone: "9876543210",
    //   },
    //   pickup: {
    //     warehouse_name: "Nuturemite",
    //     name: "Mahesh",
    //     address: "Some Warehouse, Hyderabad",
    //     city: "Hyderabad",
    //     state: "Telangana",
    //     pincode: "500055",
    //     phone: "7032383232",
    //   },
    //   order_items: [
    //     {
    //       name: "Test Product",
    //       qty: 1,
    //       price: 499,
    //       sku: "TEST123",
    //     },
    //   ],
    //   collectable_amount: 499,
    // };
  
    const logRes = await axios.post(
      "https://shipment.xpressbees.com/api/users/login",
      {
        email: process.env.XPRESS_EMAIL,
        password: process.env.XPRESS_PASSWORD,
      }
    );
    const XPRESS_TOKEN = logRes.data.data;
    console.log(XPRESS_TOKEN);

    const response = await axios.post(
      "https://shipment.xpressbees.com/api/shipments2",
      data,
      {
        headers: {
          Authorization: `Bearer ${XPRESS_TOKEN}`,
        },
      }
    );
    console.log("XpressBees order created successfully:", response.data);

    return response.data.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
const createShipmentData = (order) => {
  const isCOD = order.payment?.method === "Cash on Delivery";
  const totalPrice = Number(order.totalPrice || 0);
  const discount = Number(order.discount || 0);
  const deliveryCharges = Number(order.delCharges || 0);
  const orderAmount = totalPrice + discount + deliveryCharges;
  // calculate the total weight
  const totalWeight = order.products.reduce(
    (acc, p) => acc + (parseInt(p.product.measurements[0].withPackaging.weight) || 500),
    0
  );

  return {
    order_number: order._id,
    unique_order_number: "yes",
    shipping_charges: 0,
    discount: discount,
    cod_charges: isCOD ? 0 : 0, // Explicitly 0 unless extra fee needed

    payment_type: isCOD ? "cod" : "prepaid",
    order_amount: orderAmount,

    package_weight: totalWeight, // grams (safer default than 1000)
    package_type: 1, 
    package_breadth: 10,
    package_height: 10,
    request_auto_pickup: "yes",

    consignee: {
      name: order.buyer?.shippingAddress?.fullName || "N/A",
      address: order.address || "N/A",
      city: order.buyer?.shippingAddress?.city || "N/A",
      state: order.buyer?.shippingAddress?.state || "N/A",
      pincode: order.buyer?.shippingAddress?.pincode || "000000",
      phone: order.buyer?.shippingAddress?.phoneNumber || "0000000000",
    },

    pickup: {
      warehouse_name: "Nuturemite",
      name: "Mahesh",
      address:
        "H.No:6-264/13/A/15A, 1st Floor, Raghavaendra Colony, Quthbullapur Road,Suchitra",
      city: "HYDERABAD",
      state: "Telangana",
      pincode: "500055",
      phone: "7032383232",
    },

    order_items: order.products.map((p) => ({
      name: p.product.name || "Item",
      qty: Number(p.quantity || 1),
      price: Number(p.product.price || 0),
      sku: p.product.collection || "SKU000",
    })),

    collectable_amount: isCOD ? totalPrice : 0,
  };
};
