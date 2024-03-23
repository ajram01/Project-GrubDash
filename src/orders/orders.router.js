const methodNotAllowed = require("../errors/methodNotAllowed");

const router = require("express").Router();

const controller = require("../orders/orders.controller");

// TODO: Implement the /orders routes needed to make the tests pass
router
    .route("/")
    .post(controller.create)
    .get(controller.list)
    .all(methodNotAllowed);

router
    .route("/:orderId")
    .post(controller.create)
    .get(controller.read)
    .delete(controller.deleteOrder)
    .put(controller.update) 
    .all(methodNotAllowed)

module.exports = router;
