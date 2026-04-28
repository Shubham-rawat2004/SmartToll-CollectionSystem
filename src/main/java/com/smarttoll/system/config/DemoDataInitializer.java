package com.smarttoll.system.config;

import com.smarttoll.system.entity.Role;
import com.smarttoll.system.entity.TollBooth;
import com.smarttoll.system.entity.User;
import com.smarttoll.system.entity.Vehicle;
import com.smarttoll.system.repository.TollBoothRepository;
import com.smarttoll.system.repository.UserRepository;
import com.smarttoll.system.repository.VehicleRepository;
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DemoDataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DemoDataInitializer.class);

    private static final String DEMO_EMAIL = "anpr.user@smarttoll.com";
    private static final String DEMO_PASSWORD = "demo123";
    private static final String DEMO_TOLL_BOOTH = "Demo Toll Booth";

    @Bean
    CommandLineRunner seedDemoData(
            UserRepository userRepository,
            VehicleRepository vehicleRepository,
            TollBoothRepository tollBoothRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            User demoUser = userRepository.findByEmail(DEMO_EMAIL)
                    .orElseGet(() -> {
                        User createdUser = userRepository.save(User.builder()
                                .name("ANPR Demo User")
                                .email(DEMO_EMAIL)
                                .password(passwordEncoder.encode(DEMO_PASSWORD))
                                .role(Role.USER)
                                .walletBalance(BigDecimal.valueOf(1000))
                                .build());
                        logger.info("Seeded demo ANPR user {}", DEMO_EMAIL);
                        return createdUser;
                    });

            seedVehicle(vehicleRepository, demoUser, "UP32AB1234", "RFID-UP32AB1234");
            seedVehicle(vehicleRepository, demoUser, "HR98AA0000", "RFID-HR98AA0000");
            seedVehicle(vehicleRepository, demoUser, "HR20AU5000", "RFID-HR20AU5000");

            tollBoothRepository.findByName(DEMO_TOLL_BOOTH)
                    .orElseGet(() -> {
                        TollBooth createdBooth = tollBoothRepository.save(TollBooth.builder()
                                .name(DEMO_TOLL_BOOTH)
                                .location("Demo Plaza")
                                .tollAmount(BigDecimal.valueOf(100))
                                .build());
                        logger.info("Seeded demo toll booth {}", DEMO_TOLL_BOOTH);
                        return createdBooth;
                    });
        };
    }

    private void seedVehicle(
            VehicleRepository vehicleRepository,
            User owner,
            String vehicleNumber,
            String rfidTag
    ) {
        vehicleRepository.findByVehicleNumber(vehicleNumber)
                .orElseGet(() -> {
                    Vehicle createdVehicle = vehicleRepository.save(Vehicle.builder()
                            .vehicleNumber(vehicleNumber)
                            .owner(owner)
                            .rfidTag(rfidTag)
                            .build());
                    logger.info("Seeded demo ANPR vehicle {}", vehicleNumber);
                    return createdVehicle;
                });
    }
}
