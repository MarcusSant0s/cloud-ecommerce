-- The first demo dataset sold laptops and bicycles in a semijoia store. DataSeeder now
-- seeds jewelry, but it only runs when the product table is empty, so the old rows have
-- to go first. Everything is matched by the exact names and e-mails the old seeder used;
-- on a database without them (a fresh install, say) this does nothing.

CREATE TEMP TABLE old_demo_product ON COMMIT DROP AS
SELECT id FROM public.product WHERE name IN (
    'Notebook Acer Aspire 5',
    'Smartphone Samsung Galaxy A55',
    'Fone Sony WH-1000XM5',
    'Camiseta Polo Ralph Lauren Pima',
    'Jaqueta Corta-Vento Nike Windrunner',
    'Tênis Nike Air Max 270',
    'Sandália Havaianas Top',
    'Bicicleta Trek FX 3 Disc',
    'Tapete Persa Artesanal 2x3m',
    'Liquidificador Britânia Turbo 1200W'
);

DELETE FROM public.cart_item          WHERE product_id IN (SELECT id FROM old_demo_product);
DELETE FROM public.product_category   WHERE product_id IN (SELECT id FROM old_demo_product);
DELETE FROM public.product_collection WHERE product_id IN (SELECT id FROM old_demo_product);
-- product and product_image reference each other, so break the cycle before deleting.
UPDATE public.product SET main_image_id = NULL WHERE id IN (SELECT id FROM old_demo_product);
DELETE FROM public.product_image      WHERE product_id IN (SELECT id FROM old_demo_product);
DELETE FROM public.product            WHERE id IN (SELECT id FROM old_demo_product);

DELETE FROM public.product_category WHERE category_id IN (
    SELECT id FROM public.category
    WHERE name IN ('Eletrônicos', 'Roupas', 'Calçados', 'Esportes', 'Casa e Jardim'));
DELETE FROM public.category
    WHERE name IN ('Eletrônicos', 'Roupas', 'Calçados', 'Esportes', 'Casa e Jardim');

DELETE FROM public.product_collection WHERE collection_id IN (
    SELECT id FROM public.collection WHERE name IN ('Coleção Verão', 'Coleção Inverno'));
DELETE FROM public.collection WHERE name IN ('Coleção Verão', 'Coleção Inverno');

-- Only the old seeder's own orders, recognised by owner AND the items it created.
-- The demo users stay; the seeder reuses them.
CREATE TEMP TABLE old_demo_order ON COMMIT DROP AS
SELECT DISTINCT o.id
FROM public.orders o
JOIN public.users u ON u.id = o.user_id
JOIN public.ordem_item i ON i.order_id = o.id
WHERE u.email IN ('ana.lima@email.com', 'carlos.mendes@email.com',
                  'fernanda.costa@email.com', 'rafael.souza@email.com')
  AND i.product_name IN (
    'Notebook Acer Aspire 5', 'Fone Sony WH-1000XM5', 'Tênis Nike Air Max 270',
    'Smartphone Samsung Galaxy A55', 'Tapete Persa Artesanal 2x3m',
    'Liquidificador Britânia Turbo 1200W');

DELETE FROM public.ordem_item WHERE order_id IN (SELECT id FROM old_demo_order);
DELETE FROM public.orders     WHERE id IN (SELECT id FROM old_demo_order);
