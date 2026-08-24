package com.projectsunrise.dto.booking;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PolicyValidationResponse {
    private Boolean compliant;
    private String policyName;
    private String violationField;
    private String selectedValue;
    private String allowedValue;
    private BigDecimal selectedPrice;
    private BigDecimal allowedPrice;
    private String message;
}
