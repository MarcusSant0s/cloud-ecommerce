-- V3 constrained ACTIVE carts only, and its comment claimed any number of CHECKOUT
-- carts was "the legitimate state during a pending order". That was wrong.
--
-- Five places read the CHECKOUT cart through CartRepository.findByUserIdAndStatus,
-- which returns an Optional, so a second CHECKOUT row fails exactly the way a second
-- ACTIVE row did: "Query did not return a unique result". In production it turned
-- POST /order/{id}/cancel and POST /order/{id}/pay into 500s for the affected buyer,
-- leaving them unable to either finish or abandon their order.
--
-- The real invariant is one cart per user per status, in both directions. The
-- application now reconciles on the way into CHECKOUT as well as on the way back to
-- ACTIVE; this consolidates the rows that already exist and widens the constraint.

-- Which duplicates fold into which survivor, per (user, status). Newest wins.
CREATE TEMPORARY TABLE cart_dupes AS
WITH ranked AS (
    SELECT id,
           id_user,
           status,
           row_number() OVER (PARTITION BY id_user, status
                              ORDER BY created_date DESC, id DESC) AS rn
      FROM public.cart
     WHERE id_user IS NOT NULL
)
SELECT dup.id AS dup_id,
       keep.id AS keep_id
  FROM ranked dup
  JOIN ranked keep
    ON keep.id_user = dup.id_user
   AND keep.status = dup.status
   AND keep.rn = 1
 WHERE dup.rn > 1;

-- What the duplicates held, totalled per product and capped at stock, matching
-- CartService.mergeIntoCart: getOrCreateCart drops a line whose quantity outruns
-- stock, so an uncapped sum would lose the whole line rather than trim it.
CREATE TEMPORARY TABLE cart_dupe_items AS
SELECT d.keep_id,
       ci.product_id,
       LEAST(sum(ci.quantity), min(p.quantity))::int AS quantity
  FROM public.cart_item ci
  JOIN cart_dupes d ON d.dup_id = ci.cart_id
  JOIN public.product p ON p.id = ci.product_id
 GROUP BY d.keep_id, ci.product_id;

UPDATE public.cart_item keep_item
   SET quantity = LEAST(keep_item.quantity + m.quantity,
                        (SELECT p.quantity FROM public.product p WHERE p.id = m.product_id))
  FROM cart_dupe_items m
 WHERE keep_item.cart_id = m.keep_id
   AND keep_item.product_id = m.product_id;

INSERT INTO public.cart_item (cart_id, product_id, quantity)
SELECT m.keep_id, m.product_id, m.quantity
  FROM cart_dupe_items m
 WHERE m.quantity > 0
   AND NOT EXISTS (SELECT 1
                     FROM public.cart_item keep_item
                    WHERE keep_item.cart_id = m.keep_id
                      AND keep_item.product_id = m.product_id);

DELETE FROM public.cart_item WHERE cart_id IN (SELECT dup_id FROM cart_dupes);
DELETE FROM public.cart      WHERE id     IN (SELECT dup_id FROM cart_dupes);

DROP TABLE cart_dupe_items;
DROP TABLE cart_dupes;

-- Widen V3's ACTIVE-only index to every status.
DROP INDEX IF EXISTS public.cart_one_active_per_user;
CREATE UNIQUE INDEX cart_one_per_user_and_status ON public.cart (id_user, status);
