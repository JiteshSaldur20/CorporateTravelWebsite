package com.projectsunrise.exception;

import lombok.Getter;

@Getter
public class PolicyViolationException extends RuntimeException {
    private final String violationField;
    private final String selectedValue;
    private final String allowedValue;

    public PolicyViolationException(String message, String violationField, String selectedValue, String allowedValue) {
        super(message);
        this.violationField = violationField;
        this.selectedValue = selectedValue;
        this.allowedValue = allowedValue;
    }
}
