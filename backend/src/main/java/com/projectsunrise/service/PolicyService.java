package com.projectsunrise.service;

import com.projectsunrise.dto.booking.PolicyValidationRequest;
import com.projectsunrise.dto.booking.PolicyValidationResponse;
import com.projectsunrise.entity.EmployeeProfile;
import com.projectsunrise.entity.TravelPolicy;
import com.projectsunrise.entity.User;
import com.projectsunrise.repository.EmployeeProfileRepository;
import com.projectsunrise.repository.TravelPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final TravelPolicyRepository policyRepository;
    private final EmployeeProfileRepository employeeProfileRepository;

    public PolicyValidationResponse validatePolicy(User employee, PolicyValidationRequest request) {
        EmployeeProfile profile = employeeProfileRepository.findByUserId(employee.getId())
            .orElse(null);

        if (profile == null) {
            return PolicyValidationResponse.builder()
                .compliant(false)
                .message("No employee profile found. Contact HR.")
                .build();
        }

        TravelPolicy policy = policyRepository.findBySalaryBandAndActiveTrue(profile.getSalaryBand())
            .orElse(null);

        if (policy == null) {
            return PolicyValidationResponse.builder()
                .compliant(false)
                .message("No travel policy found for your salary band: " + profile.getSalaryBand())
                .build();
        }

        // Validate flight class
        if (request.getFlightClass() != null && request.getFlightPrice() != null) {
            TravelPolicy.FlightClass requestedClass = TravelPolicy.FlightClass.valueOf(request.getFlightClass());
            if (requestedClass.ordinal() > policy.getMaxFlightClass().ordinal()) {
                return PolicyValidationResponse.builder()
                    .compliant(false)
                    .policyName(policy.getPolicyName())
                    .violationField("flightClass")
                    .selectedValue(request.getFlightClass())
                    .allowedValue(policy.getMaxFlightClass().name())
                    .selectedPrice(request.getFlightPrice())
                    .allowedPrice(policy.getMaxFlightPrice())
                    .message("Flight class " + request.getFlightClass() + " exceeds your entitlement. " +
                             "Maximum allowed: " + policy.getMaxFlightClass().name())
                    .build();
            }

            if (request.getFlightPrice().compareTo(policy.getMaxFlightPrice()) > 0) {
                return PolicyValidationResponse.builder()
                    .compliant(false)
                    .policyName(policy.getPolicyName())
                    .violationField("flightPrice")
                    .selectedValue(request.getFlightPrice().toString())
                    .allowedValue(policy.getMaxFlightPrice().toString())
                    .selectedPrice(request.getFlightPrice())
                    .allowedPrice(policy.getMaxFlightPrice())
                    .message("Flight price ₹" + request.getFlightPrice() + " exceeds your limit of ₹" +
                             policy.getMaxFlightPrice())
                    .build();
            }
        }

        // Validate hotel
        if (request.getHotelStarRating() != null && request.getHotelPricePerNight() != null) {
            if (request.getHotelStarRating() > policy.getMaxHotelStarRating()) {
                return PolicyValidationResponse.builder()
                    .compliant(false)
                    .policyName(policy.getPolicyName())
                    .violationField("hotelStarRating")
                    .selectedValue(request.getHotelStarRating().toString())
                    .allowedValue(policy.getMaxHotelStarRating().toString())
                    .selectedPrice(request.getHotelPricePerNight())
                    .allowedPrice(policy.getMaxHotelPricePerNight())
                    .message("Hotel star rating " + request.getHotelStarRating() + " exceeds your entitlement. " +
                             "Maximum allowed: " + policy.getMaxHotelStarRating() + " stars")
                    .build();
            }

            if (request.getHotelPricePerNight().compareTo(policy.getMaxHotelPricePerNight()) > 0) {
                return PolicyValidationResponse.builder()
                    .compliant(false)
                    .policyName(policy.getPolicyName())
                    .violationField("hotelPricePerNight")
                    .selectedValue(request.getHotelPricePerNight().toString())
                    .allowedValue(policy.getMaxHotelPricePerNight().toString())
                    .selectedPrice(request.getHotelPricePerNight())
                    .allowedPrice(policy.getMaxHotelPricePerNight())
                    .message("Hotel price ₹" + request.getHotelPricePerNight() + "/night exceeds your limit of ₹" +
                             policy.getMaxHotelPricePerNight() + "/night")
                    .build();
            }
        }

        return PolicyValidationResponse.builder()
            .compliant(true)
            .policyName(policy.getPolicyName())
            .message("Selection is within policy guidelines")
            .build();
    }

    public TravelPolicy getPolicyForEmployee(User employee) {
        EmployeeProfile profile = employeeProfileRepository.findByUserId(employee.getId())
            .orElse(null);
        if (profile == null) return null;
        return policyRepository.findBySalaryBandAndActiveTrue(profile.getSalaryBand()).orElse(null);
    }
}
