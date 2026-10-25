package com.sssp.scout.repository;

import com.sssp.scout.ContactRequestStatus;
import com.sssp.scout.ScoutContactRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScoutContactRequestRepository extends JpaRepository<ScoutContactRequest, Long> {

    List<ScoutContactRequest> findByPlayerIdOrderByCreatedAtDesc(Long playerId);

    boolean existsByScoutIdAndPlayerIdAndStatus(Long scoutId, Long playerId, ContactRequestStatus status);

    Optional<ScoutContactRequest> findByIdAndPlayerId(Long id, Long playerId);
}
