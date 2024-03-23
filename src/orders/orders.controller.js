const path = require("path");

// Use the existing orders data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function validateOrder(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;

  if (!deliverTo || deliverTo === "") return res.status(400).json({ error: "Order must include a deliverTo" });
  if (!mobileNumber || mobileNumber === "") return res.status(400).json({ error: "Order must include a mobileNumber" });
  if (!dishes) return res.status(400).json({ error: "Order must include dishes" });
  if (!Array.isArray(dishes) || dishes.length === 0) return res.status(400).json({ error: "Order must include at least one dish" });
  dishes.forEach((dish, index) => {
    if (!dish.quantity || dish.quantity <= 0 || typeof dish.quantity !== 'number') {
      return res.status(400).json({ error: `Dish ${index} must have a quantity that is an integer greater than 0` });
    }
  });

  // Handling status for updates specifically
  if (req.method === "PUT") {
    if (!status || status === "" || status === "invalid") {
      return res.status(400).json({ error: "Order must have a valid status" });
    }
  }
  
  next();
}

function idMatches(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;

  if (id && orderId !== id) {
    return res.status(400).json({ error: `Order id does not match route id. Order: ${id}, Route: ${orderId}` });
  }
  next();
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find(order => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  } else {
    return res.status(404).json({ error: `Order id not found: ${orderId}` });
  }
}

function list(req, res) {
  res.json({ data: orders });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes, status = "pending" } = {} } = req.body; // Default status to "pending" for new orders
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    dishes,
    status,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function update(req, res) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes; 
  order.status = status;

  res.json({ data: order });
}

function deleteOrder(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex(order => order.id === orderId);
  if (index > -1) {
    orders.splice(index, 1);
    res.sendStatus(204);
  }
}

function validateDeletion(req, res, next) {
  const order = res.locals.order;
  if (order.status !== "pending") {
    return res.status(400).json({ error: "An order can only be deleted if it is pending." });
  }
  next();
}

module.exports = {
  list,
  create: [validateOrder, create],
  read: [orderExists, read],
  update: [orderExists, idMatches, validateOrder, update],
  deleteOrder: [orderExists, validateDeletion, deleteOrder],
};

