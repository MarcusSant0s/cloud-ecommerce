-- cart.created_date was never written.
--
-- Cart.createdDate carried Spring Data's @CreatedDate, which only fires when JPA
-- auditing is enabled (@EnableJpaAuditing plus AuditingEntityListener on the
-- entity). Neither was ever configured, so the annotation was inert and every
-- cart was inserted with a NULL created_date. The entity now sets the value from
-- @PrePersist, the same way Order.createdAt and User.createdAt already did.
--
-- Rows written before that fix have no recoverable creation time — it was never
-- stored — so they are stamped with the migration time. Treat those values as an
-- upper bound on when the cart was created, not as the real timestamp.
UPDATE public.cart
   SET created_date = now()
 WHERE created_date IS NULL;

-- Defence in depth: the default covers any insert that bypasses JPA, and NOT NULL
-- means a regression like the one above fails loudly instead of writing NULLs again.
ALTER TABLE public.cart ALTER COLUMN created_date SET DEFAULT now();
ALTER TABLE public.cart ALTER COLUMN created_date SET NOT NULL;
