package com.projectsunrise.service;

import java.util.Map;

/**
 * Maps employee designations to salary bands.
 * Call {@link #resolveBand(String)} whenever a designation is set or changed.
 */
public final class SalaryBandMapper {

    private SalaryBandMapper() {}

    private static final Map<String, String> BAND_A = Map.of(
        "employee", "BAND_A",
        "junior worker", "BAND_A",
        "intern", "BAND_A"
    );

    private static final Map<String, String> BAND_B = Map.of(
        "senior manager", "BAND_B",
        "assistant manager", "BAND_B",
        "senior employee", "BAND_B"
    );

    private static final Map<String, String> BAND_C = Map.of(
        "director", "BAND_C",
        "ceo", "BAND_C",
        "coo", "BAND_C",
        "cfo", "BAND_C"
    );

    /**
     * Returns the salary band for the given designation, or {@code null}
     * if the designation doesn't match any known band.
     */
    public static String resolveBand(String designation) {
        if (designation == null || designation.isBlank()) {
            return null;
        }
        String normalised = designation.trim().toLowerCase();

        // Exact match against the three lookup maps
        String band = BAND_A.get(normalised);
        if (band != null) return band;

        band = BAND_B.get(normalised);
        if (band != null) return band;

        band = BAND_C.get(normalised);
        if (band != null) return band;

        // VP variants: "VP", "Vice President", "VP Engineering", etc.
        if (normalised.startsWith("vp") || normalised.startsWith("vice president")) {
            return "BAND_C";
        }

        return null;
    }
}
