package com.projectsunrise.controller;

import com.projectsunrise.dto.booking.PolicyValidationRequest;
import com.projectsunrise.dto.booking.PolicyValidationResponse;
import com.projectsunrise.entity.TravelPolicy;
import com.projectsunrise.entity.User;
import com.projectsunrise.repository.TravelPolicyRepository;
import com.projectsunrise.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
@Tag(name = "Policies", description = "Travel policy management and validation")
public class PolicyController {

    private final PolicyService policyService;
    private final TravelPolicyRepository policyRepository;

    /** Get all active policies — all authenticated roles */
    @GetMapping
    @Operation(summary = "Get active policies", description = "Returns all active travel policies.")
    public ResponseEntity<List<TravelPolicy>> getAllPolicies() {
        return ResponseEntity.ok(policyRepository.findByActiveTrue());
    }

    /** Get all policies (including inactive) — admin only */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all policies (admin)", description = "Returns all policies including inactive ones. Admin only.")
    public ResponseEntity<List<TravelPolicy>> getAllPoliciesIncludingInactive() {
        return ResponseEntity.ok(policyRepository.findAll());
    }

    /** Get a single policy by ID — all authenticated roles */
    @GetMapping("/{id}")
    @Operation(summary = "Get policy by ID", description = "Returns a single travel policy.")
    public ResponseEntity<TravelPolicy> getPolicyById(@PathVariable Long id) {
        return policyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Get the policy assigned to the current employee */
    @GetMapping("/me")
    @Operation(summary = "Get my policy", description = "Returns the policy assigned to the current employee.")
    public ResponseEntity<TravelPolicy> getMyPolicy(@AuthenticationPrincipal User user) {
        TravelPolicy policy = policyService.getPolicyForEmployee(user);
        return ResponseEntity.ok(policy);
    }

    /** Create a new policy — admin only */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create policy", description = "Creates a new travel policy. Admin only.")
    public ResponseEntity<TravelPolicy> createPolicy(
            @RequestBody TravelPolicy policy,
            @AuthenticationPrincipal User user) {
        policy.setCreatedBy(user);
        TravelPolicy saved = policyRepository.save(policy);
        return ResponseEntity.ok(saved);
    }

    /** Update an existing policy — admin only */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update policy", description = "Updates an existing travel policy. Admin only.")
    public ResponseEntity<TravelPolicy> updatePolicy(
            @PathVariable Long id,
            @RequestBody TravelPolicy updates) {
        return policyRepository.findById(id).map(existing -> {
            existing.setPolicyName(updates.getPolicyName());
            existing.setDescription(updates.getDescription());
            existing.setSalaryBand(updates.getSalaryBand());
            existing.setMaxFlightClass(updates.getMaxFlightClass());
            existing.setMaxFlightPrice(updates.getMaxFlightPrice());
            existing.setMaxFlightDurationHours(updates.getMaxFlightDurationHours());
            existing.setMaxHotelStarRating(updates.getMaxHotelStarRating());
            existing.setMaxHotelPricePerNight(updates.getMaxHotelPricePerNight());
            existing.setActive(updates.getActive());
            TravelPolicy saved = policyRepository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Delete a policy (soft-delete by deactivating) — admin only */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate policy", description = "Soft-deletes a policy by marking it inactive. Admin only.")
    public ResponseEntity<Map<String, String>> deletePolicy(@PathVariable Long id) {
        return policyRepository.findById(id).map(existing -> {
            existing.setActive(false);
            policyRepository.save(existing);
            return ResponseEntity.ok(Map.of("message", "Policy deactivated"));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Validate a booking against the employee's policy */
    @PostMapping("/validate")
    @Operation(summary = "Validate policy", description = "Checks if a proposed booking complies with the employee's travel policy.")
    public ResponseEntity<PolicyValidationResponse> validatePolicy(
            @RequestBody PolicyValidationRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(policyService.validatePolicy(user, request));
    }
}
