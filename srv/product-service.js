const productService = require('./product-service');

// srv/product-service.js

function calculateTotal(configurations) {
    let total = 0;
    configurations.forEach(config => {
        total += config.price;
    });
    return total;
}
module.exports = function(){
    const { Invoice_Details } = this.entities;
    this.on('READ', Invoice_Details, async (req) => ({...req.data, Subtotal: calculateTotal(req.data.configurations)}));
};
