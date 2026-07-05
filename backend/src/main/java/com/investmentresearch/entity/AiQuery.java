package com.investmentresearch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_queries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiQuery {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String query;

    @Column(columnDefinition = "TEXT")
    private String response;

    @Column(length = 20)
    private String queryType;

    @Column(length = 20)
    private String ticker;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
