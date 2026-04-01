package com.smarttoll.system.repository;

import com.smarttoll.system.entity.TollBooth;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TollBoothRepository extends JpaRepository<TollBooth, Long> {

    Optional<TollBooth> findByName(String name);
}
