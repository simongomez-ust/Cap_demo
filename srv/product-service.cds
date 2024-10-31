using {Producto as my} from '../db/schema';
 

service productService {

    entity producto as projection on my;

}