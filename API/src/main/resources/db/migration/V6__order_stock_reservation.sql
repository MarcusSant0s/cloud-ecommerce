-- Stock now leaves the shelf when the order is created, not when it is paid, and
-- comes back if the order is cancelled. stock_reserved records whether an order is
-- currently holding its units, so they are never taken or returned twice.
--
-- Existing rows follow the old rule: a paid order (and anything after it) already
-- took its stock on approval; a pending or cancelled one never did. A pending order
-- from before this migration is then reserved leniently when its payment lands.

ALTER TABLE public.orders ADD COLUMN stock_reserved boolean NOT NULL DEFAULT false;

UPDATE public.orders
   SET stock_reserved = true
 WHERE status IN ('PAID', 'SHIPPED', 'DELIVERED', 'REFUNDED');
