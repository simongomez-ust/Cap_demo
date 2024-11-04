namespace demo.Products;

@cds.persistence.table
entity Products {
    key ID_Mobile         : UUID;
    Name                  : String(100);
    Brand                 : String(50);
    Price                 : Decimal(15,2);
}

@cds.persistence.table
entity Configuration {
    key ID_Configuration  : UUID;
    ID_Mobile             : Association to Products;
    ID_Invoice            : UUID;
    Invoice               : Association to Invoice_Details on Invoice.ID_Invoice = ID_Invoice; 
    Config_Name           : String(100);
    RAM                   : Integer;
    Storage               : Integer;
    Processor             : String(50);
    Display               : String(50);
    Battery               : Integer;
    Config_Price          : Decimal(15,2);
}

@cds.persistence.table
entity Invoice_Details {
    key ID_Invoice        : UUID;
    Configurations        : Association to many Configuration on Configurations.ID_Invoice = $self.ID_Invoice;
    Subtotal              : Decimal(15,2);
}