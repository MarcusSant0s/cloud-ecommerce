package com.project.API.review;

/**
 * Uma avaliação do Google, já reduzida ao que a vitrine mostra.
 *
 * `authorUri` aponta para o perfil de quem avaliou no Google Maps: os termos da
 * Places API exigem manter a atribuição do autor visível, então ele não é
 * decoração — é requisito de uso.
 */
public record GoogleReview(
        String authorName,
        String authorPhotoUrl,
        String authorUri,
        int rating,
        String text,
        String relativeTime
) {}
