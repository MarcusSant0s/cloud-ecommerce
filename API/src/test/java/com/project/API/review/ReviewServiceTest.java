package com.project.API.review;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * O cache existe porque a Places API é cobrada por requisição e avaliação muda
 * raramente: sem ele, cada visita da home viraria uma cobrança.
 */
class ReviewServiceTest {

    private GooglePlacesClient client;

    @BeforeEach
    void setUp() {
        client = Mockito.mock(GooglePlacesClient.class);
    }

    private ReviewsResponse withOneReview(String text) {
        return new ReviewsResponse(
                List.of(new GoogleReview("Maria", "photo", "uri", 5, text, "há 2 meses")),
                4.9, 37);
    }

    @Test
    @DisplayName("a segunda chamada vem do cache, sem nova ida à API")
    void shouldServeTheSecondCallFromCache() {
        when(client.fetch()).thenReturn(withOneReview("linda peça"));
        ReviewService service = new ReviewService(client, 6);

        service.getReviews();
        ReviewsResponse second = service.getReviews();

        assertEquals("linda peça", second.reviews().get(0).text());
        verify(client, times(1)).fetch();
    }

    @Test
    @DisplayName("falha na atualização preserva o que já estava em cache")
    void shouldKeepCachedDataWhenARefreshComesBackEmpty() {
        // TTL zero: toda chamada revalida, que é o cenário em que a falha aparece.
        ReviewService service = new ReviewService(client, 0);
        when(client.fetch()).thenReturn(withOneReview("linda peça"));
        service.getReviews();

        when(client.fetch()).thenReturn(ReviewsResponse.empty());
        ReviewsResponse result = service.getReviews();

        assertEquals(1, result.reviews().size(),
                "avaliação de ontem é melhor que seção vazia");
        assertEquals("linda peça", result.reviews().get(0).text());
    }

    @Test
    @DisplayName("sem nada em cache, uma falha devolve vazio em vez de explodir")
    void shouldReturnEmptyWhenThereIsNothingToFallBackOn() {
        when(client.fetch()).thenReturn(ReviewsResponse.empty());
        ReviewService service = new ReviewService(client, 6);

        ReviewsResponse result = service.getReviews();

        assertTrue(result.reviews().isEmpty());
        assertNull(result.rating());
    }

    @Test
    @DisplayName("passado o TTL, busca de novo")
    void shouldRefetchAfterTheTtl() {
        ReviewService service = new ReviewService(client, 0);
        when(client.fetch()).thenReturn(withOneReview("primeira"));
        service.getReviews();

        when(client.fetch()).thenReturn(withOneReview("segunda"));

        assertEquals("segunda", service.getReviews().reviews().get(0).text());
        verify(client, times(2)).fetch();
    }
}
