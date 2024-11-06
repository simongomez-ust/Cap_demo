
const { log } = require("@sap/cds");
const { uuid } = require("@sap/cds/lib/utils/cds-utils");

module.exports = function productService() {
  const { Invoice_Details, ConfigurationInvoice, Configuration} = this.entities;
  this.on("CREATE", Invoice_Details, async (request) => {
    const { configurations } = request.data;
 
    // Verificar el stock antes de la creación

    for (const config of configurations) {
      const configuration = await SELECT.one.from(Configuration,config.ID);
 
      if (!configuration || configuration.stock <= 0) {
        return request.error(400, `Stock is not sufficient for configuration ID ${config.ID}`);
      }
    }
 
    // Reducir el stock si las comprobaciones son correctas
    for (const config of configurations) {
      await callReduceStock(config.ID,request);
    }
 
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

    const configurationInvoices = configurations.map(cnfig => ({
      configuration_ID: cnfig.ID,
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

