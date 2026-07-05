package com.investmentresearch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "watchlist_items", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "ticker"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String ticker;

    @Column(length = 100)
    private String companyName;

    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime addedAt;
}
