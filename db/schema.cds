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
    ID_Configuration      : Association to Configuration;
    Subtotal              : Decimal(15,2);
}