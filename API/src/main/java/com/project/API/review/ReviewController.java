package com.project.API.review;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Público: alimenta a home, que qualquer visitante vê sem login.
    @GetMapping
    public ReviewsResponse getReviews() {
        return reviewService.getReviews();
    }
}
