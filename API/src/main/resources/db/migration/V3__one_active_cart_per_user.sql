-- A user must never hold more than one ACTIVE cart, and until now nothing said so.
--
-- CartService.getOrCreateCart mints a cart whenever the user has no ACTIVE one — which
-- includes simply opening the cart page while an order sits pending — and three places
-- flipped a CHECKOUT cart back to ACTIVE without checking whether one already existed
-- (CartCleanupScheduler, the "rejected" webhook branch, and the createCheckout failure
-- path reached from repayOrder). CartRepository.findByUserIdAndStatus returns an
-- Optional, so the second row made every cart request for that user fail with
-- "Query did not return a unique result", permanently, until the data was fixed by hand.
--
-- The application side now reconciles instead of flipping. This closes the hole under
-- it: consolidate the duplicates that already exist, then let the database refuse new
-- ones — including the two-concurrent-requests race no application check can win.

-- Which duplicate carts fold into which survivor. Newest wins: it is the one the buyer
-- has been using most recently.
CREATE TEMPORARY TABLE cart_dupes AS
WITH ranked AS (
    SELECT id,
           id_user,
           row_number() OVER (PARTITION BY id_user
                              ORDER BY created_date DESC, id DESC) AS rn
      FROM public.cart
     WHERE status = 'ACTIVE'
       AND id_user IS NOT NULL
)
SELECT dup.id AS dup_id,
       keep.id AS keep_id
  FROM ranked dup
  JOIN ranked keep ON keep.id_user = dup.id_user AND keep.rn = 1
 WHERE dup.rn > 1;

-- What the duplicates were holding, totalled per product and capped at stock, matching
-- what CartService.mergeIntoCart does at runtime: getOrCreateCart drops a line whose
-- quantity outruns stock, so an uncapped sum would lose the whole line, not trim it.
CREATE TEMPORARY TABLE cart_dupe_items AS
SELECT d.keep_id,
       ci.product_id,
       LEAST(sum(ci.quantity), min(p.quantity))::int AS quantity
  FROM public.cart_item ci
  JOIN cart_dupes d ON d.dup_id = ci.cart_id
  JOIN public.product p ON p.id = ci.product_id
 GROUP BY d.keep_id, ci.product_id;

-- Product already on the surviving cart: fold into that line.
UPDATE public.cart_item keep_item
   SET quantity = LEAST(keep_item.quantity + m.quantity,
                        (SELECT p.quantity FROM public.product p WHERE p.id = m.product_id))
  FROM cart_dupe_items m
 WHERE keep_item.cart_id = m.keep_id
   AND keep_item.product_id = m.product_id;

-- Product only on a duplicate: one new line on the survivor.
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

-- The invariant itself. Partial, so a user may still have one ACTIVE cart alongside any
-- number of CHECKOUT ones, which is the legitimate state during a pending order.
CREATE UNIQUE INDEX cart_one_active_per_user
    ON public.cart (id_user)
 WHERE status = 'ACTIVE';
