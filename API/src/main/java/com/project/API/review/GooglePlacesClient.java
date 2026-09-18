package com.project.API.review;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

/**
 * Lê as avaliações do perfil do negócio na Places API (New).
 *
 * A chave vive aqui, no servidor, e nunca no front-end: uma chave do Google
 * embutida no bundle é extraível por qualquer visitante e faturada na conta de
 * quem a publicou.
 *
 * A API devolve no máximo 5 avaliações — as que o Google considera mais
 * relevantes — e não há parâmetro para pedir mais. `rating` e `userRatingCount`,
 * porém, refletem o total.
 */
@Component
public class GooglePlacesClient {

    private static final Logger log = LoggerFactory.getLogger(GooglePlacesClient.class);

    private static final String BASE_URL = "https://places.googleapis.com/v1/places/";

    // Sem field mask a Places API (New) recusa a requisição — e cobrar-se pelo
    // que não se pede seria desperdício, já que o preço varia por campo.
    private static final String FIELD_MASK = "reviews,rating,userRatingCount";

    private final RestClient restClient = RestClient.create();

    @Value("${google.places.api-key:}")
    private String apiKey;

    @Value("${google.places.place-id:}")
    private String placeId;

    @Value("${google.places.language:pt-BR}")
    private String language;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank()
                && placeId != null && !placeId.isBlank();
    }

    public ReviewsResponse fetch() {
        if (!isConfigured()) {
            log.warn("Avaliações do Google desativadas: "
                    + "google.places.api-key e/ou google.places.place-id não configurados");
            return ReviewsResponse.empty();
        }

        try {
            PlaceDetails details = restClient.get()
                    .uri(BASE_URL + placeId + "?languageCode=" + language)
                    .header("X-Goog-Api-Key", apiKey)
                    .header("X-Goog-FieldMask", FIELD_MASK)
                    .retrieve()
                    .body(PlaceDetails.class);

            if (details == null || details.reviews() == null) {
                return ReviewsResponse.empty();
            }

            List<GoogleReview> reviews = details.reviews().stream()
                    .filter(r -> r.text() != null && r.text().text() != null && !r.text().text().isBlank())
                    .map(GooglePlacesClient::toReview)
                    .toList();

            return new ReviewsResponse(reviews, details.rating(), details.userRatingCount());

        } catch (Exception e) {
            // A home não pode cair porque o Google respondeu mal. Sem avaliações,
            // a seção simplesmente não é renderizada.
            log.error("Falha ao buscar avaliações do Google", e);
            return ReviewsResponse.empty();
        }
    }

    private static GoogleReview toReview(Review r) {
        Attribution author = r.authorAttribution();
        return new GoogleReview(
                author == null ? null : author.displayName(),
                author == null ? null : author.photoUri(),
                author == null ? null : author.uri(),
                r.rating(),
                r.text().text(),
                r.relativePublishTimeDescription()
        );
    }

    // ── Formato da Places API (New) ──────────────────────────────────────────

    @JsonIgnoreProperties(ignoreUnknown = true)
    record PlaceDetails(List<Review> reviews, Double rating, Integer userRatingCount) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Review(
            LocalizedText text,
            int rating,
            String relativePublishTimeDescription,
            Attribution authorAttribution
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record LocalizedText(String text, String languageCode) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Attribution(String displayName, String uri, String photoUri) {}
}
