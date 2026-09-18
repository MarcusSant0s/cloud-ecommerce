package com.project.API.review;

import java.util.List;

/**
 * O que a home consome. `rating` e `totalRatings` são do negócio inteiro, não
 * das avaliações listadas — a Places API devolve no máximo 5 avaliações, mas a
 * média e a contagem consideram todas.
 */
public record ReviewsResponse(
        List<GoogleReview> reviews,
        Double rating,
        Integer totalRatings
) {
    public static ReviewsResponse empty() {
        return new ReviewsResponse(List.of(), null, null);
    }
}
