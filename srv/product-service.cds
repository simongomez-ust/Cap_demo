using {demo.Products as db} from '../db/schema';


service productService {

    entity Products as projection on db.Products;
    @cds.search:{config_name}
    entity Configuration as projection on db.Configuration;// where exists mobile;

    entity Invoice_Details as projection on db.Invoice_Details where exists configurations;
        
    entity ConfigurationInvoice as projection on db.ConfigurationInvoice;

    entity Shoping_Cart as projection on db.Shoping_Cart;// where exists configurations;
 
    entity CartConfigurations as projection on db.CartConfigurations;
 
    action addToCart(cart: Shoping_Cart:ID, config: Configuration:ID) returns CartConfigurations;
    action createInvoiceFromCart(shoping_cart_ID: Shoping_Cart:ID) returns Invoice_Details;
    action removeUnusedCarts();
    action removeFromCart(cart: Shoping_Cart:ID, config: Configuration:ID);
}