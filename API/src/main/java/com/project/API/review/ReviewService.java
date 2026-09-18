package com.project.API.review;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Serve as avaliações do Google com cache em memória.
 *
 * A Places API é cobrada por requisição e avaliação muda raramente, então buscar
 * a cada visita da home seria pagar por dado idêntico. O cache é por instância —
 * suficiente aqui, onde roda um container só; com várias réplicas cada uma teria
 * o seu, o que apenas multiplica as chamadas pelo número de réplicas, não por
 * visitante.
 */
@Service
public class ReviewService {

    private final GooglePlacesClient client;
    private final Duration cacheTtl;

    private final AtomicReference<Cached> cache = new AtomicReference<>(null);

    // TTL por construtor, não por campo @Value: assim o cache é exercitável num
    // teste comum, sem contexto do Spring nem reflection.
    public ReviewService(
            GooglePlacesClient client,
            @Value("${google.places.cache-ttl-hours:6}") long cacheTtlHours
    ) {
        this.client = client;
        this.cacheTtl = Duration.ofHours(cacheTtlHours);
    }

    public ReviewsResponse getReviews() {
        Cached current = cache.get();
        if (current != null && !current.isStale(cacheTtl)) {
            return current.data();
        }

        ReviewsResponse fresh = client.fetch();

        // Uma falha momentânea não deve apagar o que já estava em cache: é melhor
        // mostrar avaliação de ontem do que seção vazia.
        if (fresh.reviews().isEmpty() && current != null && !current.data().reviews().isEmpty()) {
            return current.data();
        }

        cache.set(new Cached(fresh, Instant.now()));
        return fresh;
    }

    private record Cached(ReviewsResponse data, Instant fetchedAt) {
        boolean isStale(Duration ttl) {
            return Instant.now().isAfter(fetchedAt.plus(ttl));
        }
    }
}
