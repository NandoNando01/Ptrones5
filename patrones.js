// ===== FACTORY: crea productos según el tipo =====
class Producto {                                          // clase base de todos los productos
  constructor(nombre, precio) {                           // recibe nombre y precio
    this.nombre = nombre;                                 // guarda el nombre
    this.precio = precio;                                 // guarda el precio
  }
  getPrecio() { return this.precio; }                     // devuelve el precio normal
}
class Herramienta extends Producto {}                     // tipo de producto: herramienta
class Material extends Producto {}                        // tipo de producto: material

class ProductoFactory {                                   // la fábrica
  static crear(tipo, nombre, precio) {                    // método estático: no hace falta instanciar la fábrica
    if (tipo === "herramienta")                           // si piden herramienta...
      return new Herramienta(nombre, precio);             // ...crea una herramienta
    if (tipo === "material")                              // si piden material...
      return new Material(nombre, precio);                // ...crea un material
    throw new Error("Tipo desconocido: " + tipo);         // si el tipo no existe, lanza error
  }
}

// ===== DECORATOR: agrega descuento sin tocar la clase original =====
class ConDescuento {                                      // el decorador (envuelve a un producto)
  constructor(producto, porcentaje) {                     // recibe el producto y el % de descuento
    this.producto = producto;                             // guarda el producto original
    this.nombre = producto.nombre + " (oferta)";          // cambia el nombre para marcar la oferta
    this.porcentaje = porcentaje;                         // guarda el porcentaje
  }
  getPrecio() {                                           // mismo método que Producto (misma interfaz)
    return this.producto.getPrecio() * (1 - this.porcentaje / 100); // precio original menos el descuento
  }
}

// ===== MODELO: SINGLETON + OBSERVER =====
class Inventario {                                        // el Modelo: guarda los datos
  static instancia = null;                                // aquí se guarda la única instancia
  static getInstance() {                                  // forma oficial de obtener el inventario
    if (!Inventario.instancia)                            // si todavía no existe...
      Inventario.instancia = new Inventario();            // ...lo crea (solo esta vez)
    return Inventario.instancia;                          // siempre devuelve el mismo
  }
  constructor() {                                         // se ejecuta una sola vez
    this.productos = [];                                  // lista de productos
    this.observadores = [];                               // lista de suscriptores (Observer)
  }
  suscribir(fn) { this.observadores.push(fn); }           // agrega a alguien que quiere recibir avisos
  agregar(p) {                                            // agrega un producto al inventario
    this.productos.push(p);                               // lo guarda en la lista
    this.observadores.forEach(fn => fn(p));               // avisa a todos los suscriptores
  }
}

// ===== VISTA: solo muestra =====
class Vista {                                             // la Vista: solo se encarga de mostrar
  mostrarProducto(p) {                                    // recibe un producto
    console.log(`📦 ${p.nombre} - Q${p.getPrecio().toFixed(2)}`); // imprime nombre y precio con 2 decimales
  }
}

// ===== CONTROLADOR: conecta todo =====
class Controlador {                                       // el Controlador: coordina Modelo y Vista
  constructor() {
    this.modelo = Inventario.getInstance();               // obtiene el Singleton
    this.vista = new Vista();                             // crea la vista
    this.modelo.suscribir(p => this.vista.mostrarProducto(p)); // la vista se suscribe a los cambios
  }
  agregarProducto(tipo, nombre, precio, descuento = 0) {  // descuento es opcional (0 por defecto)
    let p = ProductoFactory.crear(tipo, nombre, precio);  // la Factory crea el producto
    if (descuento > 0) p = new ConDescuento(p, descuento);// si hay descuento, lo envuelve con el Decorator
    this.modelo.agregar(p);                               // lo manda al Modelo (esto dispara el Observer)
  }
}

// ===== DEMO =====
const app = new Controlador();                            // arranca la aplicación
app.agregarProducto("herramienta", "Martillo", 80);       // producto normal
app.agregarProducto("material", "Cemento", 95, 10);       // con 10% de descuento
app.agregarProducto("herramienta", "Taladro", 450, 20);   // con 20% de descuento

console.log("Total en inventario:", Inventario.getInstance().productos.length); // cuenta los productos (3)
console.log("¿Es el mismo Singleton?", Inventario.getInstance() === app.modelo); // true: es la misma instancia