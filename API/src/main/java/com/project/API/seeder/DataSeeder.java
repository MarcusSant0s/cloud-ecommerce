package com.project.API.seeder;

import com.project.API.category.Category;
import com.project.API.category.CategoryRepository;
import com.project.API.order.Order;
import com.project.API.order.OrderItem;
import com.project.API.order.OrderRepository;
import com.project.API.order.OrderStatus;
import com.project.API.product.Product;
import com.project.API.product.ProductRepository;
import com.project.API.productImage.ProductImage;
import com.project.API.user.Role;
import com.project.API.user.User;
import com.project.API.user.UserAdress;
import com.project.API.user.UserAdressRepository;
import com.project.API.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("local")
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserAdressRepository userAdressRepository;
    private final OrderRepository orderRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataSeeder(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            UserAdressRepository userAdressRepository,
            OrderRepository orderRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.userAdressRepository = userAdressRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) return;

        List<Category> categories = seedCategories();
        List<Product> products = seedProducts(categories);
        List<User> users = seedUsers();
        seedOrders(users, products);
    }

    // ── seeding ──────────────────────────────────────────────────────────────

    private List<Category> seedCategories() {
        return categoryRepository.saveAll(List.of(
                category("Eletrônicos",  "categories/eletronicos.jpg",
                        "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400"),
                category("Roupas",       "categories/roupas.jpg",
                        "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400"),
                category("Calçados",     "categories/calcados.jpg",
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"),
                category("Esportes",     "categories/esportes.jpg",
                        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400"),
                category("Casa e Jardim","categories/casa.jpg",
                        "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400")
        ));
    }

    private List<Product> seedProducts(List<Category> cats) {
        Category eletronicos = cats.get(0);
        Category roupas      = cats.get(1);
        Category calcados    = cats.get(2);
        Category esportes    = cats.get(3);
        Category casa        = cats.get(4);

        // Build products — images added to the `images` set (cascade ALL) but
        // mainImage is NOT set here because it is a non-cascaded @OneToOne.
        // Setting a transient ProductImage there would throw
        // TransientPropertyValueException on flush.
        Product notebook = product(
                "Notebook Acer Aspire 5",
                "Notebook Intel Core i5 12ª geração, 8GB RAM DDR4, SSD 512GB NVMe, tela Full HD 15.6\" IPS. Ideal para trabalho, estudos e entretenimento.",
                15, new BigDecimal("3199.90"), new BigDecimal("0.10"),
                eletronicos);
        addImages(notebook,
                img("products/notebook-1.jpg", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800", true),
                img("products/notebook-2.jpg", "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800", false));

        Product smartphone = product(
                "Smartphone Samsung Galaxy A55",
                "Celular 5G, tela Super AMOLED 6.6\", câmera tripla 50MP+12MP+5MP, bateria 5000mAh, 128GB/8GB RAM.",
                42, new BigDecimal("1899.99"), new BigDecimal("0.08"),
                eletronicos);
        addImages(smartphone,
                img("products/smartphone-1.jpg", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800", true),
                img("products/smartphone-2.jpg", "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800", false));

        Product fone = product(
                "Fone Sony WH-1000XM5",
                "Headphone over-ear com cancelamento de ruído, bateria de 30h, Bluetooth 5.2 e design dobrável.",
                30, new BigDecimal("1499.00"), new BigDecimal("0.15"),
                eletronicos);
        addImages(fone,
                img("products/fone-1.jpg", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", true));

        Product camiseta = product(
                "Camiseta Polo Ralph Lauren Pima",
                "Polo masculina em algodão Pima premium, corte slim, bordado icônico do cavaleiro. Perfeita para casuais e semiformais.",
                80, new BigDecimal("349.90"), null,
                roupas);
        addImages(camiseta,
                img("products/camiseta-1.jpg", "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800", true));

        Product jaqueta = product(
                "Jaqueta Corta-Vento Nike Windrunner",
                "Jaqueta leve em ripstop com capuz dobrável, bolso canguru com zíper. Ideal para corridas ao ar livre.",
                25, new BigDecimal("589.00"), new BigDecimal("0.12"),
                roupas, esportes);
        addImages(jaqueta,
                img("products/jaqueta-1.jpg", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800", true),
                img("products/jaqueta-2.jpg", "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800", false));

        Product tenis = product(
                "Tênis Nike Air Max 270",
                "Tênis com maior unidade Air Max do calcanhar, cabedal em mesh respirável e sola em borracha com entressola React.",
                60, new BigDecimal("799.99"), new BigDecimal("0.05"),
                calcados, esportes);
        addImages(tenis,
                img("products/tenis-1.jpg", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", true),
                img("products/tenis-2.jpg", "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800", false));

        Product sandalia = product(
                "Sandália Havaianas Top",
                "Sandália feminina com solado anatômico em borracha natural e palmilha texturizada antiderrapante.",
                200, new BigDecimal("49.90"), null,
                calcados);
        addImages(sandalia,
                img("products/sandalia-1.jpg", "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800", true));

        Product bicicleta = product(
                "Bicicleta Trek FX 3 Disc",
                "Bicicleta híbrida, quadro alumínio Alpha Gold, garfo carbono, Shimano Deore 24v, freios disco hidráulicos.",
                8, new BigDecimal("4299.00"), new BigDecimal("0.07"),
                esportes);
        addImages(bicicleta,
                img("products/bicicleta-1.jpg", "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800", true));

        Product tapete = product(
                "Tapete Persa Artesanal 2x3m",
                "Tapete artesanal em lã com 150.000 nós/m², padrões orientais, 200×300cm. Cores vibrantes e duráveis.",
                12, new BigDecimal("2150.00"), new BigDecimal("0.20"),
                casa);
        addImages(tapete,
                img("products/tapete-1.jpg", "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800", true));

        Product liquidificador = product(
                "Liquidificador Britânia Turbo 1200W",
                "Motor 1200W, 12 velocidades + pulsar, copo acrílico 2L, lâminas inox, base antiderrapante.",
                55, new BigDecimal("189.90"), null,
                casa);
        addImages(liquidificador,
                img("products/liquidificador-1.jpg", "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800", true));

        // Pass 1: persist products — images cascade-saved, mainImage still null
        List<Product> saved = productRepository.saveAll(List.of(
                notebook, smartphone, fone,
                camiseta, jaqueta,
                tenis, sandalia,
                bicicleta,
                tapete, liquidificador
        ));

        // Pass 2: now images have IDs — wire mainImage and save again
        for (Product p : saved) {
            p.getImages().stream()
                    .filter(ProductImage::isMain)
                    .findFirst()
                    .ifPresent(p::setMainImage);
        }
        return productRepository.saveAll(saved);
    }

    private List<User> seedUsers() {
        User ana      = user("Ana",      "Lima",     "ana.lima@email.com",      "senha123",
                address("Rua das Flores",         "São Paulo",        "01310-100", "45"));
        User carlos   = user("Carlos",   "Mendes",   "carlos.mendes@email.com", "senha123",
                address("Avenida Atlântica",       "Rio de Janeiro",   "22070-000", "1702"));
        User fernanda = user("Fernanda", "Costa",    "fernanda.costa@email.com","senha123",
                address("Rua XV de Novembro",      "Curitiba",         "80020-310", "200"));
        User rafael   = user("Rafael",   "Souza",    "rafael.souza@email.com",  "senha123",
                address("Rua da Bahia",            "Belo Horizonte",   "30160-010", "12"));
        User julia    = user("Júlia",    "Oliveira", "julia.oliveira@email.com","senha123",
                address("Avenida Paulista",        "São Paulo",        "01310-000", "900"));

        return userRepository.saveAll(List.of(ana, carlos, fernanda, rafael, julia));
    }

    private void seedOrders(List<User> users, List<Product> products) {
        User ana      = users.get(0);
        User carlos   = users.get(1);
        User fernanda = users.get(2);
        User rafael   = users.get(3);

        Product notebook      = products.get(0);
        Product smartphone    = products.get(1);
        Product fone          = products.get(2);
        Product tenis         = products.get(5);
        Product tapete        = products.get(8);
        Product liquidificador= products.get(9);

        // Ana — pago: notebook + fone
        Order o1 = new Order();
        o1.setUser(ana);
        o1.setStatus(OrderStatus.PAID);
        o1.setCreatedAt(LocalDateTime.now().minusDays(15));
        o1.setPaidAt(LocalDateTime.now().minusDays(15).plusMinutes(30));
        o1.setMercadoPagoPreferenceId("pref-ana-001");
        o1.setMercadoPagoPaymentId("pay-ana-001");
        o1.addItem(orderItem(notebook, 1));
        o1.addItem(orderItem(fone, 1));
        o1.setTotal(priceOf(notebook).add(priceOf(fone)));

        // Carlos — pago: tênis (×2) + smartphone
        Order o2 = new Order();
        o2.setUser(carlos);
        o2.setStatus(OrderStatus.PAID);
        o2.setCreatedAt(LocalDateTime.now().minusDays(8));
        o2.setPaidAt(LocalDateTime.now().minusDays(8).plusMinutes(10));
        o2.setMercadoPagoPreferenceId("pref-carlos-001");
        o2.setMercadoPagoPaymentId("pay-carlos-001");
        o2.addItem(orderItem(tenis, 2));
        o2.addItem(orderItem(smartphone, 1));
        o2.setTotal(priceOf(tenis).multiply(new BigDecimal("2")).add(priceOf(smartphone)));

        // Carlos — pendente: tapete
        Order o3 = new Order();
        o3.setUser(carlos);
        o3.setStatus(OrderStatus.PENDING);
        o3.setCreatedAt(LocalDateTime.now().minusHours(3));
        o3.setMercadoPagoPreferenceId("pref-carlos-002");
        o3.addItem(orderItem(tapete, 1));
        o3.setTotal(priceOf(tapete));

        // Fernanda — cancelado: liquidificador (×3)
        Order o4 = new Order();
        o4.setUser(fernanda);
        o4.setStatus(OrderStatus.CANCELLED);
        o4.setCreatedAt(LocalDateTime.now().minusDays(20));
        o4.addItem(orderItem(liquidificador, 3));
        o4.setTotal(priceOf(liquidificador).multiply(new BigDecimal("3")));

        // Rafael — pago recente: fone
        Order o5 = new Order();
        o5.setUser(rafael);
        o5.setStatus(OrderStatus.PAID);
        o5.setCreatedAt(LocalDateTime.now().minusDays(2));
        o5.setPaidAt(LocalDateTime.now().minusDays(2).plusMinutes(5));
        o5.setMercadoPagoPreferenceId("pref-rafael-001");
        o5.setMercadoPagoPaymentId("pay-rafael-001");
        o5.addItem(orderItem(fone, 1));
        o5.setTotal(priceOf(fone));

        orderRepository.saveAll(List.of(o1, o2, o3, o4, o5));
    }

    // ── builders ─────────────────────────────────────────────────────────────

    private Category category(String name, String s3key, String url) {
        Category c = new Category();
        c.setName(name);
        c.setS3key(s3key);
        c.setUrl(url);
        return c;
    }

    private Product product(String name, String description, int qty,
                             BigDecimal priceOriginal, BigDecimal discount,
                             Category... categories) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setQuantity(qty);
        p.setPriceOriginal(priceOriginal);
        p.setPriceDiscount(discount);
        for (Category c : categories) p.AddCategory(c);
        return p;
    }

    private void addImages(Product product, ProductImage... images) {
        for (ProductImage img : images) {
            product.AddImages(img);
            // mainImage wired in pass 2 after first saveAll — see seedProducts()
        }
    }

    private ProductImage img(String s3key, String url, boolean main) {
        ProductImage img = new ProductImage();
        img.setS3Key(s3key);
        img.setUrl(url);
        img.setMain(main);
        return img;
    }

    private UserAdress address(String street, String city, String cep, String number) {
        return userAdressRepository.save(new UserAdress(street, city, cep, number));
    }

    private User user(String firstName, String lastName, String email,
                      String rawPassword, UserAdress adress) {
        User u = new User(firstName, lastName, email, passwordEncoder.encode(rawPassword));
        u.setRole(Role.USER);
        u.setUserAdress(adress);
        return u;
    }

    private OrderItem orderItem(Product p, int qty) {
        String url = p.getMainImage() != null ? p.getMainImage().getUrl() : "";
        return new OrderItem(p.getId(), p.getName(), p.getPriceOriginal(), qty, url, p.getDescription());
    }

    private BigDecimal priceOf(Product p) {
        return p.getPriceDiscount() != null
                ? p.getPriceOriginal().multiply(BigDecimal.ONE.subtract(p.getPriceDiscount()))
                : p.getPriceOriginal();
    }
}
