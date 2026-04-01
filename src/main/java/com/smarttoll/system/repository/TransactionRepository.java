package com.smarttoll.system.repository;

import com.smarttoll.system.entity.Transaction;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByVehicleOwnerIdOrderByTimestampDesc(Long ownerId);

    List<Transaction> findByVehicleVehicleNumberOrderByTimestampDesc(String vehicleNumber);

    Optional<Transaction> findTopByVehicleIdAndTollBoothIdOrderByTimestampDesc(Long vehicleId, Long tollBoothId);

    List<Transaction> findByTimestampAfterOrderByTimestampDesc(LocalDateTime timestamp);
}
