const { log } = require("@sap/cds");
const { uuid } = require("@sap/cds/lib/utils/cds-utils");
 
module.exports = function productService() {
  const { Invoice_Details, ConfigurationInvoice, Configuration, Shoping_Cart, CartConfigurations} = this.entities;

  this.on("addToCart" , async (req) =>{
    const{ cart , config} = req.data
    const id = uuid();
 
    const cart_config = {
      ID:id,
      configuration_ID:config,
      shoping_cart_ID:cart
    }
 
    await INSERT(cart_config).into(CartConfigurations)
    return cart_config;
  })
 
  this.on("removeFromCart", req =>{
    const{ cart , config} = req.data
 
    const cart_config = {
      configuration:config,
      shoping_cart:cart
    }
 
    DELETE(cart_config).one.from(CartConfigurations)
  })
 
  this.on("createInvoiceFromCart", async (request) => {
    const { shoping_cart_ID } = request.data;
    const cartConfigurations = await SELECT.from(CartConfigurations).where({ shoping_cart_ID });
    
    const configurations = await Promise.all(cartConfigurations.map(async ({ configuration_ID }) => {
      return await SELECT.one.from(Configuration, configuration_ID);
    }));

    // Verificar el stock antes de la creación 
    const hasStock = configurations.every(({ stock }) => stock > 0);
    if (!hasStock) {
        return request.error(400, `Stock is not sufficient for configuration ID ${configuration_ID}`);
    }
 
    // Reducir el stock si las comprobaciones son correctas
    await Promise.all(configurations.map(async ({ ID }) => callReduceStock(ID,request)));

 
    const invoiceId = uuid();
    const subtotal = calculateSubtotal(configurations);
 
    const invoice = await insertInvoice(invoiceId, subtotal);
   
    await insertConfigurationsInToInvoice(configurations, invoiceId);
   
    return { ...invoice, invoice_ID: invoiceId };
  });
 
  this.on("READ", Invoice_Details, async () => {
    const invoices = await SELECT.from(Invoice_Details);
 
    const invoicesWithConfigurations = await Promise.all(invoices.map(async (invoice) => {
      const configurationsInInvoice = await SELECT.from(ConfigurationInvoice).where({ invoice_ID: invoice.ID });
 
      const configs = await getConfigurations(configurationsInInvoice);
      return { ...invoice, configurations: configs };      
    }));
 
    return invoicesWithConfigurations;
  });
  
async function insertInvoice(invoiceId, subtotal) {
 
  const invoice = {
    ID: invoiceId,
    subtotal: subtotal,
  };
 
  return await INSERT(invoice).into(Invoice_Details);
}
 
  async function getConfigurations(configurationsInInvoice) {
    return Promise.all(configurationsInInvoice.map(async (configurationInInvoice) =>
      SELECT.one.from(Configuration).where({ ID: configurationInInvoice.configuration_ID })
    ));
  }
 
  async function insertConfigurationsInToInvoice(configurations, invoiceId) {
 
    const configurationInvoices = configurations.map(({ID}) => ({
      configuration_ID: ID,
      invoice_ID: invoiceId
    }));
 
    await INSERT(configurationInvoices).into(ConfigurationInvoice);
  }
 
 
 
  async function callReduceStock(config,req) {
     let selectConfig = await SELECT.one.from(Configuration,config)
     
      if (!selectConfig) return req.error (404, `Configuration #${config} doesn't exist`)
      if (selectConfig.stock <= 0) return req.error (400, `Not enough stock`)
       
      let newStock = selectConfig.stock - 1;
      await UPDATE(Configuration,config) .set({stock: newStock});
  }
};
 
function calculateSubtotal(configurations) {
  let totalAmount = 0;
  if (Array.isArray(configurations)) {
    configurations.forEach((config) => {
      totalAmount += config.config_price;
    });
  }
 
  return totalAmount;
}
 