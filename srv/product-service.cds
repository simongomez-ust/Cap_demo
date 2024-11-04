using {demo.Products as db} from '../db/schema';
 

service productService {

    entity Products as projection on db.Products;

    entity Configuration as projection on db.Configuration where exists ID_Mobile;

    entity Invoice_Details as projection on db.Invoice_Details where exists Configurations;

}