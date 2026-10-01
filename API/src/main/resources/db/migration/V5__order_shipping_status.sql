-- PAID was the last state an order could reach, so nothing told a paid order still
-- waiting to be packed apart from one already on its way. The admin dashboard needs
-- that line: SHIPPED and DELIVERED extend the status, and the order records when it
-- left and, when there is one, the carrier's tracking code.

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
    status IN ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')
);

ALTER TABLE public.orders ADD COLUMN shipped_at timestamp(6) without time zone;
ALTER TABLE public.orders ADD COLUMN tracking_code character varying(64);
