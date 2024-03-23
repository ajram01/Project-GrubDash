const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign IDs when necessary
const nextId = require("../utils/nextId");

function validateDish(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  
  if (!name || name === "") return res.status(400).json({ error: "Dish must include a name" });
  if (!description || description === "") return res.status(400).json({ error: "Dish must include a description" });
  if (!image_url || image_url === "") return res.status(400).json({ error: "Dish must include an image_url" });
  if (price === undefined) return res.status(400).json({ error: "Dish must include a price" });
  if (typeof price !== 'number' || price <= 0) return res.status(400).json({ error: "Dish must have a price that is an integer greater than 0" });

  next();
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  } else {
    return res.status(404).json({ error: `Dish id not found: ${dishId}` });
  }
}

function idMatches(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  
  if (id && dishId !== id) {
    return res.status(400).json({ error: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}` });
  }
  next();
}

function list(req, res) {
  res.json({ data: dishes });
}

function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function update(req, res) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;

  // Update the dish
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

module.exports = {
  list,
  create: [validateDish, create],
  read: [dishExists, read],
  update: [dishExists, validateDish, idMatches, update],
};
