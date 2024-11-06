
const { log } = require("@sap/cds");
const { uuid } = require("@sap/cds/lib/utils/cds-utils");

module.exports = function productService() {
  const { Invoice_Details, ConfigurationInvoice, Configuration} = this.entities;
// Service Events  ----------------------------

  this.on("CREATE", Invoice_Details, async (request) => {
    const { configurations } = request.data;
    
    const invoiceId = uuid();
    const subtotal = calculateSubtotal(configurations);

    const invoice = await insterInvoice(invoiceId, subtotal);
    
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

  this.on('reduceStock', async (req) => {
    let { config: id } = req.data;
    let selectConfig = await SELECT.one.from(Configuration).where({ ID: id });
   
    if (selectConfig) {
        let newStock = selectConfig.stock - 1;
        await UPDATE(Configuration,id) .set({stock: newStock});
    }
});
  
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

  async function insterInvoice(invoiceId, subtotal) {

    const invoice = {
      ID: invoiceId,
      subtotal: subtotal,
    };
    
    return await INSERT(invoice).into(Invoice_Details);
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
