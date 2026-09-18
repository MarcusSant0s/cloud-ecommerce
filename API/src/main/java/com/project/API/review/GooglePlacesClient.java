package com.project.API.review;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

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

        } catch (RestClientResponseException e) {
            // 4xx do Google é quase sempre configuração, não falha momentânea, e
            // se repetiria a cada expiração do cache. Stack trace não ajuda a
            // resolver nenhum destes; a mensagem do Google, sim.
            log.error("Google recusou a requisição de avaliações ({}): {}{}",
                    e.getStatusCode(), googleMessage(e), hintFor(e));
            return ReviewsResponse.empty();

        } catch (Exception e) {
            // Rede, timeout, resposta ilegível. A home não pode cair por isso —
            // sem avaliações, a seção simplesmente não é renderizada.
            log.error("Falha ao buscar avaliações do Google", e);
            return ReviewsResponse.empty();
        }
    }

    private static String googleMessage(RestClientResponseException e) {
        try {
            GoogleError body = e.getResponseBodyAs(GoogleError.class);
            if (body != null && body.error() != null && body.error().message() != null) {
                return body.error().message();
            }
        } catch (Exception ignored) {
            // Corpo fora do formato esperado — cai no genérico abaixo.
        }
        return e.getStatusText();
    }

    /**
     * As três recusas que de fato acontecem, e o que fazer com cada uma. Sem
     * isto, quem lê o log vê "403 Forbidden" e não sabe que o problema está no
     * tipo de restrição da chave, não no código.
     */
    private static String hintFor(RestClientResponseException e) {
        String body = e.getResponseBodyAsString();

        if (body.contains("API_KEY_HTTP_REFERRER_BLOCKED")) {
            return "  → A chave está restrita por referenciador HTTP, que é o tipo para uso"
                    + " no navegador. Esta chamada sai do servidor e não envia Referer."
                    + " No Google Cloud Console, troque a restrição da chave para"
                    + " endereços IP e informe o IP de saída do servidor.";
        }
        if (body.contains("API_KEY_IP_ADDRESS_BLOCKED")) {
            return "  → A chave está restrita a IPs que não incluem o IP de saída deste"
                    + " servidor. Confira qual IP o container usa para sair"
                    + " (atrás de NAT costuma não ser o do host) e adicione-o à chave.";
        }
        if (body.contains("API_KEY_SERVICE_BLOCKED") || body.contains("SERVICE_DISABLED")) {
            return "  → A chave não tem permissão para a Places API (New), ou a API não está"
                    + " habilitada no projeto. Habilite \"Places API (New)\" e inclua-a nas"
                    + " restrições de API da chave.";
        }
        if (body.contains("API_KEY_INVALID")) {
            return "  → GOOGLE_PLACES_API_KEY não é uma chave válida.";
        }
        return "";
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GoogleError(ErrorDetail error) {
        @JsonIgnoreProperties(ignoreUnknown = true)
        record ErrorDetail(Integer code, String message, String status) {}
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
