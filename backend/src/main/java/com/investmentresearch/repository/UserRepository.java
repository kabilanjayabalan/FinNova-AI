package com.investmentresearch.repository;
import com.investmentresearch.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);
}
