
const { uuid } = require("@sap/cds/lib/utils/cds-utils");

module.exports = function productService() {
  const { Invoice_Details, ConfigurationInvoice, Configuration} = this.entities;
// Service Events  ----------------------------

  this.on("CREATE", Invoice_Details, async (request) => {
    const { Configurations } = request.data;

    const invoiceId = uuid();
    const subtotal = calculateSubtotal(Configurations);

    const invoice = await insterInvoice(invoiceId, subtotal);
    
    await insertConfigurationsInToInvoice(Configurations, invoiceId);
    
    return { ...invoice, ID_Invoice: invoiceId };
  });

  this.on("READ", Invoice_Details, async () => {
    const invoices = await SELECT.from(Invoice_Details);

    const invoicesWithConfigurations = await Promise.all(invoices.map(async (invoice) => {
      const configurationsInInvoice = await SELECT.from(ConfigurationInvoice).where({ Invoice_ID_Invoice: invoice.ID_Invoice });

      const configurations = await getConfigurations(configurationsInInvoice);
      return { ...invoice, Configurations: configurations };       
    }));
  
    return invoicesWithConfigurations;
  });

  this.on('reduceStock', async (req) => {
    let { config: id } = req.data;
    let selectConfig = await SELECT.one.from(Configuration).where({ ID_Configuration: id });
   
    if (selectConfig) {
        let newStock = selectConfig.Stock - 1;
        await UPDATE(Configuration,id) .set({Stock: newStock});
    }
});
  
  async function getConfigurations(configurationsInInvoice) {
    return Promise.all(configurationsInInvoice.map(async (configurationInInvoice) => 
      SELECT.one.from(Configuration).where({ ID_Configuration: configurationInInvoice.Configuration_ID_Configuration })
    ));
  }

  async function insertConfigurationsInToInvoice(configurations, invoiceId) {

    const configurationInvoices = configurations.map(configuration => ({
      Configuration_ID_Configuration: configuration.ID_Configuration,
      Invoice_ID_Invoice: invoiceId
    }));

    await INSERT(configurationInvoices).into(ConfigurationInvoice);
  }

  async function insterInvoice(invoiceId, subtotal) {

    const invoice = {
      ID_Invoice: invoiceId,
      Subtotal: subtotal,
    };
    
    return await INSERT(invoice).into(Invoice_Details);
  }
};

function calculateSubtotal(configurations) {
  let totalAmount = 0;
  if (Array.isArray(configurations)) {
    configurations.forEach((config) => {
      totalAmount += config.Config_Price;
    });
  }
  return totalAmount;
}
