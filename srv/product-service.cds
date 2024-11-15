using {demo.Products as db} from '../db/schema';


service productService {

    entity Products as projection on db.Products;
    @cds.search:{config_name}
    entity Configuration as projection on db.Configuration;// where exists mobile;

    entity Invoice_Details as projection on db.Invoice_Details where exists configurations;
        
    entity ConfigurationInvoice as projection on db.ConfigurationInvoice;

    entity Shopping_Cart as projection on db.Shopping_Cart;// where exists configurations;
 
    entity CartConfigurations as projection on db.CartConfigurations;
 
    action addToCart(cart: Shopping_Cart:ID, config: Configuration:ID) returns CartConfigurations;
    action createInvoiceFromCart(shopping_cart_ID: Shopping_Cart:ID) returns Invoice_Details;
    action removeUnusedCarts();
    action removeFromCart(cart: Shopping_Cart:ID, config: Configuration:ID);
}