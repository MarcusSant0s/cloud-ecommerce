package com.project.API.seeder;

import com.project.API.category.Category;
import com.project.API.category.CategoryRepository;
import com.project.API.collection.ProductCollection;
import com.project.API.collection.ProductCollectionRepository;
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
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@ConditionalOnProperty(name = "app.seed-demo-data", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductCollectionRepository collectionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UserAdressRepository userAdressRepository;
    private final OrderRepository orderRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataSeeder(
            CategoryRepository categoryRepository,
            ProductCollectionRepository collectionRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            UserAdressRepository userAdressRepository,
            OrderRepository orderRepository,
            BCryptPasswordEncoder passwordEncoder
    ) {
        this.categoryRepository = categoryRepository;
        this.collectionRepository = collectionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.userAdressRepository = userAdressRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // The guard only looks at products, and the admin panel can delete every product
    // while leaving categories, collections and users behind. Those three have unique
    // names/e-mails, so they are reused when present: inserting them again would throw,
    // and an exception here stops the application from starting.
    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) return;

        List<Category> categories = seedCategories();
        List<Product> products = seedProducts(categories);
        seedCollections(products);
        List<User> users = seedUsers();
        // Orders have no natural key, so seeding again for users who already have some
        // would duplicate them. Only the demo users count: an unrelated order elsewhere
        // in the database is no reason to leave the demo accounts without history.
        boolean demoOrdersExist = users.stream()
                .anyMatch(u -> orderRepository.countByUserId(u.getId()) > 0);
        if (!demoOrdersExist) seedOrders(users, products);
    }

    // ── seeding ──────────────────────────────────────────────────────────────

    private List<Category> seedCategories() {
        return List.of(
                category("Brincos", "categories/brincos.jpg",
                        "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400"),
                category("Colares", "categories/colares.jpg",
                        "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400"),
                category("Anéis", "categories/aneis.jpg",
                        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400"),
                category("Pulseiras", "categories/pulseiras.jpg",
                        "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400")
        );
    }

    private List<Product> seedProducts(List<Category> cats) {
        Category brincos   = cats.get(0);
        Category colares   = cats.get(1);
        Category aneis     = cats.get(2);
        Category pulseiras = cats.get(3);

        // Pass 1: persist products — images cascade-saved, mainImage still null.
        // mainImage is a non-cascaded @OneToOne, so setting a transient ProductImage
        // here would throw TransientPropertyValueException on flush.
        List<Product> saved = productRepository.saveAll(List.of(
                jewel("Brinco Argola Trançada",
                        "Argola trançada com banho de ouro 18k e fecho clique. Leve, com presença na medida para o dia inteiro.",
                        24, "129.90", null, brincos, "argola-trancada", "1617038220319-276d3cfab638"),
                jewel("Brinco Gota Azul Cristal",
                        "Brinco em prata 925 com cristal azul em lapidação gota e contorno cravejado de zircônias. Para ocasiões especiais.",
                        12, "189.90", "0.10", brincos, "gota-azul", "1535632066927-ab7c9ab60908"),
                jewel("Brinco Coração Azul",
                        "Coração em cristal azul com gancho em banho de ouro 18k. Delicado e leve na orelha.",
                        30, "89.90", null, brincos, "coracao-azul", "1630019852942-f89202989a59"),
                jewel("Colar Pérolas Clássico",
                        "Fio de pérolas sintéticas em graduação uniforme, com fecho em prata 925. Vem em caixa para presente.",
                        10, "249.90", null, colares, "perolas-classico", "1515562141207-7a88fb7ce338"),
                jewel("Colar Coração Cravejado",
                        "Pingente de coração vazado com zircônias em corrente de prata 925, comprimento de 45 cm.",
                        18, "199.90", null, colares, "coracao-cravejado", "1588444837495-c6cfeb53f32d"),
                jewel("Colar Medalha em Camadas",
                        "Três correntes em banho de ouro 18k com medalha texturizada. Já vem montado, sem risco de embaraçar.",
                        16, "229.90", "0.10", colares, "medalha-camadas", "1635767798638-3e25273a8236"),
                jewel("Colar Corrente de Elos",
                        "Corrente de elos médios em banho de ouro 18k, comprimento de 42 cm. Sozinha ou com pingente.",
                        22, "179.90", null, colares, "corrente-elos", "1633810542706-90e5ff7557be"),
                jewel("Colar Ponto de Luz",
                        "Corrente fina em banho de ouro 18k com pingente de zircônia em gota. Um clássico para usar todo dia.",
                        28, "139.90", null, colares, "ponto-de-luz", "1611652022419-a9419f74343d"),
                jewel("Anel Solitário Halo",
                        "Zircônia central com halo cravejado e aro em prata 925. Disponível do aro 14 ao 22.",
                        14, "159.90", null, aneis, "solitario-halo", "1605100804763-247f67b3557e"),
                jewel("Anel Pedra Rosa",
                        "Cristal rosa em lapidação retangular, contorno de zircônias e banho de ouro rosé 18k.",
                        9, "179.90", "0.15", aneis, "pedra-rosa", "1603561591411-07134e71a2a9"),
                jewel("Anel Trio Empilhável",
                        "Conjunto de três aros em banho de ouro 18k, com detalhes cravejados. Use juntos ou separados.",
                        20, "139.90", null, aneis, "trio-empilhavel", "1543294001-f7cd5d7fb516"),
                jewel("Pulseira Elos Grossos",
                        "Pulseira de elos grossos em banho de ouro 18k, 18 cm com extensor. Marcante sem pesar no pulso.",
                        19, "169.90", null, pulseiras, "elos-grossos", "1602173574767-37ac01994b2a"),
                jewel("Pulseira Riviera Zircônia",
                        "Riviera em prata 925 com zircônias entrelaçadas. Brilho de festa com fecho de segurança.",
                        11, "219.90", "0.10", pulseiras, "riviera-zirconia", "1573408301185-9146fe634ad0"),
                jewel("Pulseira Arabesco Rosé",
                        "Bracelete articulado em banho de ouro rosé 18k, com desenho arabesco cravejado.",
                        13, "149.90", null, pulseiras, "arabesco-rose", "1611591437281-460bfbe1220a")
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

    private Product jewel(String name, String description, int qty, String price, String discount,
                          Category category, String imageKey, String unsplashId) {
        Product p = product(name, description, qty, new BigDecimal(price),
                discount == null ? null : new BigDecimal(discount), category);
        addImages(p, img("products/" + imageKey + ".jpg",
                "https://images.unsplash.com/photo-" + unsplashId + "?w=800", true));
        return p;
    }

    // Product owns the product_collection join table, so the collections are attached
    // to the already-persisted products and re-saved rather than set from this side.
    private void seedCollections(List<Product> products) {
        ProductCollection ouro  = collection("Banho de Ouro 18k", "collections/ouro-18k.jpg",
                "https://images.unsplash.com/photo-1620656798579-1984d9e87df7?w=400");
        ProductCollection prata = collection("Prata 925", "collections/prata-925.jpg",
                "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=400");

        for (int i : List.of(0, 2, 5, 6, 7, 9, 10, 11, 13)) products.get(i).AddCollection(ouro);
        for (int i : List.of(1, 3, 4, 8, 12)) products.get(i).AddCollection(prata);

        productRepository.saveAll(products);
    }

    private List<User> seedUsers() {
        User ana      = user("Ana",      "Lima",     "ana.lima@email.com",      "senha123",
                "Rua das Flores",         "São Paulo",        "01310-100", "45");
        User carlos   = user("Carlos",   "Mendes",   "carlos.mendes@email.com", "senha123",
                "Avenida Atlântica",       "Rio de Janeiro",   "22070-000", "1702");
        User fernanda = user("Fernanda", "Costa",    "fernanda.costa@email.com","senha123",
                "Rua XV de Novembro",      "Curitiba",         "80020-310", "200");
        User rafael   = user("Rafael",   "Souza",    "rafael.souza@email.com",  "senha123",
                "Rua da Bahia",            "Belo Horizonte",   "30160-010", "12");
        User julia    = user("Júlia",    "Oliveira", "julia.oliveira@email.com","senha123",
                "Avenida Paulista",        "São Paulo",        "01310-000", "900");

        return List.of(ana, carlos, fernanda, rafael, julia);
    }

    private void seedOrders(List<User> users, List<Product> products) {
        User ana      = users.get(0);
        User carlos   = users.get(1);
        User fernanda = users.get(2);
        User rafael   = users.get(3);

        Product argola    = products.get(0);
        Product coracao   = products.get(2);
        Product perolas   = products.get(3);
        Product medalha   = products.get(5);
        Product solitario = products.get(8);
        Product riviera   = products.get(12);

        // Ana — entregue: colar de pérolas + brinco argola
        Order o1 = new Order();
        o1.setUser(ana);
        o1.setStatus(OrderStatus.DELIVERED);
        o1.setCreatedAt(LocalDateTime.now().minusDays(15));
        o1.setPaidAt(LocalDateTime.now().minusDays(15).plusMinutes(30));
        o1.setShippedAt(LocalDateTime.now().minusDays(14));
        o1.setTrackingCode("QB123456789BR");
        o1.setMercadoPagoPreferenceId("pref-ana-001");
        o1.setStockReserved(true);
        o1.setMercadoPagoPaymentId("pay-ana-001");
        o1.addItem(orderItem(perolas, 1));
        o1.addItem(orderItem(argola, 1));
        o1.setTotal(priceOf(perolas).add(priceOf(argola)));

        // Carlos — enviado: anel solitário (×2) + pulseira riviera
        Order o2 = new Order();
        o2.setUser(carlos);
        o2.setStatus(OrderStatus.SHIPPED);
        o2.setCreatedAt(LocalDateTime.now().minusDays(8));
        o2.setPaidAt(LocalDateTime.now().minusDays(8).plusMinutes(10));
        o2.setShippedAt(LocalDateTime.now().minusDays(7));
        o2.setTrackingCode("QB987654321BR");
        o2.setMercadoPagoPreferenceId("pref-carlos-001");
        o2.setStockReserved(true);
        o2.setMercadoPagoPaymentId("pay-carlos-001");
        o2.addItem(orderItem(solitario, 2));
        o2.addItem(orderItem(riviera, 1));
        o2.setTotal(priceOf(solitario).multiply(new BigDecimal("2")).add(priceOf(riviera)));

        // Carlos — pendente: colar medalha
        Order o3 = new Order();
        o3.setUser(carlos);
        o3.setStatus(OrderStatus.PENDING);
        o3.setCreatedAt(LocalDateTime.now().minusHours(3));
        o3.setMercadoPagoPreferenceId("pref-carlos-002");
        o3.addItem(orderItem(medalha, 1));
        o3.setTotal(priceOf(medalha));

        // Fernanda — cancelado: brinco coração (×3)
        Order o4 = new Order();
        o4.setUser(fernanda);
        o4.setStatus(OrderStatus.CANCELLED);
        o4.setCreatedAt(LocalDateTime.now().minusDays(20));
        o4.addItem(orderItem(coracao, 3));
        o4.setTotal(priceOf(coracao).multiply(new BigDecimal("3")));

        // Rafael — pago e ainda não enviado (passa do prazo de envio): pulseira riviera
        Order o5 = new Order();
        o5.setUser(rafael);
        o5.setStatus(OrderStatus.PAID);
        o5.setCreatedAt(LocalDateTime.now().minusDays(2));
        o5.setPaidAt(LocalDateTime.now().minusDays(2).plusMinutes(5));
        o5.setMercadoPagoPreferenceId("pref-rafael-001");
        o5.setStockReserved(true);
        o5.setMercadoPagoPaymentId("pay-rafael-001");
        o5.addItem(orderItem(riviera, 1));
        o5.setTotal(priceOf(riviera));

        orderRepository.saveAll(List.of(o1, o2, o3, o4, o5));
    }

    // ── builders ─────────────────────────────────────────────────────────────

    private Category category(String name, String s3key, String url) {
        return categoryRepository.findByName(name).orElseGet(() -> {
            Category c = new Category();
            c.setName(name);
            c.setS3key(s3key);
            c.setUrl(url);
            return categoryRepository.save(c);
        });
    }

    private ProductCollection collection(String name, String s3key, String url) {
        return collectionRepository.findByName(name).orElseGet(() -> {
            ProductCollection c = new ProductCollection();
            c.setName(name);
            c.setS3key(s3key);
            c.setUrl(url);
            return collectionRepository.save(c);
        });
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
        UserAdress a = new UserAdress(street, city, cep, number);
        a.setBairro("Centro");
        a.setPhone("(11) 98888-0000");
        return userAdressRepository.save(a);
    }

    private User user(String firstName, String lastName, String email, String rawPassword,
                      String street, String city, String cep, String number) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User(firstName, lastName, email, passwordEncoder.encode(rawPassword));
            u.setRole(Role.USER);
            u.setUserAdress(address(street, city, cep, number));
            return userRepository.save(u);
        });
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
