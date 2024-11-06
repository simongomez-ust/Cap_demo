namespace demo.Products;

@cds.persistence.table
entity Products {
    key ID                : UUID;
    name                  : String(100);
    brand                 : String(50);
 }

@cds.persistence.table
entity Configuration {
    key ID  : UUID;
    mobile                : Association to Products;
    invoices              : Association to many ConfigurationInvoice on invoices.configuration = $self; 
    config_name           : String(100);
    ram                   : Integer;
    storage               : Integer;
    processor             : String(50);
    display               : String(50);
    battery               : Integer;
    config_price          : Decimal(15,2);
    stock                 : Integer;
}

@cds.persistence.table
entity Invoice_Details {
    key ID        : UUID;
    configurations        : Association to many ConfigurationInvoice on configurations.invoice = $self;
    subtotal              : Decimal(15,2);
}

@cds.persistence.table
entity ConfigurationInvoice {
    configuration         : Association to Configuration;
    invoice               : Association to Invoice_Details;
}