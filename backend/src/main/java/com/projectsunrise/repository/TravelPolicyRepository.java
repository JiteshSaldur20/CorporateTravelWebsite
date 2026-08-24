package com.projectsunrise.repository;

import com.projectsunrise.entity.TravelPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TravelPolicyRepository extends JpaRepository<TravelPolicy, Long> {
    List<TravelPolicy> findByActiveTrue();
    Optional<TravelPolicy> findBySalaryBandAndActiveTrue(String salaryBand);
    Optional<TravelPolicy> findByPolicyName(String policyName);
}
