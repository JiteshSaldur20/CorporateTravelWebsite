package com.projectsunrise.service;

import com.projectsunrise.dto.booking.BookingResponse;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Slf4j
@Service
public class TicketPdfService {

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD);
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 11, Font.BOLD);
    private static final Font BODY_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL);
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL);
    private static final Font AMOUNT_FONT = new Font(Font.HELVETICA, 14, Font.BOLD);

    public byte[] generateTicket(BookingResponse booking) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // Title
            Paragraph title = new Paragraph("SUNRISE — TRAVEL TICKET", TITLE_FONT);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(8);
            document.add(title);

            // Reference and status
            Paragraph ref = new Paragraph("Booking Ref: " + booking.getBookingReference(), HEADER_FONT);
            ref.setAlignment(Element.ALIGN_CENTER);
            ref.setSpacingAfter(4);
            document.add(ref);

            Paragraph status = new Paragraph("Status: " + booking.getStatus(), BODY_FONT);
            status.setAlignment(Element.ALIGN_CENTER);
            status.setSpacingAfter(16);
            document.add(status);

            // Separator line
            document.add(Chunk.NEWLINE);

            // Traveller Info
            document.add(createSectionHeader("TRAVELLER INFORMATION"));
            PdfPTable travellerTable = createTwoColumnTable();
            travellerTable.addCell(createLabelCell("Name"));
            travellerTable.addCell(createValueCell(booking.getEmployeeName()));
            travellerTable.addCell(createLabelCell("Email"));
            travellerTable.addCell(createValueCell(booking.getEmployeeEmail()));
            travellerTable.addCell(createLabelCell("Purpose"));
            travellerTable.addCell(createValueCell(booking.getTravelPurpose()));
            travellerTable.addCell(createLabelCell("Passengers"));
            travellerTable.addCell(createValueCell(String.valueOf(booking.getNumberOfPassengers())));
            document.add(travellerTable);
            document.add(Chunk.NEWLINE);

            // Travel Details
            document.add(createSectionHeader("TRAVEL DETAILS"));
            PdfPTable travelTable = createTwoColumnTable();
            travelTable.addCell(createLabelCell("Type"));
            travelTable.addCell(createValueCell(booking.getType()));
            travelTable.addCell(createLabelCell("Start Date"));
            travelTable.addCell(createValueCell(String.valueOf(booking.getTravelStartDate())));
            travelTable.addCell(createLabelCell("End Date"));
            travelTable.addCell(createValueCell(String.valueOf(booking.getTravelEndDate())));
            if (booking.getOrigin() != null) {
                travelTable.addCell(createLabelCell("Route"));
                travelTable.addCell(createValueCell(booking.getOrigin() + " → " + booking.getDestination()));
            }
            document.add(travelTable);
            document.add(Chunk.NEWLINE);

            // Flight Details
            if (booking.getSelectedFlight() != null) {
                document.add(createSectionHeader("FLIGHT DETAILS"));
                PdfPTable flightTable = createTwoColumnTable();
                flightTable.addCell(createLabelCell("Flight"));
                flightTable.addCell(createValueCell(booking.getSelectedFlight().getFlightNumber() + " — " + booking.getSelectedFlight().getAirline()));
                if (booking.getSelectedFlight().getBoardingTime() != null) {
                    flightTable.addCell(createLabelCell("Boarding Time"));
                    flightTable.addCell(createValueCell(booking.getSelectedFlight().getBoardingTime().toString()));
                }
                flightTable.addCell(createLabelCell("Departure"));
                flightTable.addCell(createValueCell(booking.getSelectedFlight().getDepartureDateTime() != null ? booking.getSelectedFlight().getDepartureDateTime().toLocalTime().toString().substring(0, 5) : "—"));
                flightTable.addCell(createLabelCell("Arrival"));
                flightTable.addCell(createValueCell(booking.getSelectedFlight().getArrivalDateTime() != null ? booking.getSelectedFlight().getArrivalDateTime().toLocalTime().toString().substring(0, 5) : "—"));
                flightTable.addCell(createLabelCell("Class"));
                flightTable.addCell(createValueCell(booking.getSelectedFlight().getTravelClass()));
                flightTable.addCell(createLabelCell("Duration"));
                flightTable.addCell(createValueCell(booking.getSelectedFlight().getDurationMinutes() + " min" + (booking.getSelectedFlight().getStops() == 0 ? " (Direct)" : " (" + booking.getSelectedFlight().getStops() + " stop(s))")));
                flightTable.addCell(createLabelCell("Price"));
                flightTable.addCell(createValueCell("₹" + booking.getFlightPrice()));
                document.add(flightTable);
                document.add(Chunk.NEWLINE);
            }

            // Hotel Details
            if (booking.getSelectedHotel() != null) {
                document.add(createSectionHeader("HOTEL DETAILS"));
                PdfPTable hotelTable = createTwoColumnTable();
                hotelTable.addCell(createLabelCell("Hotel"));
                hotelTable.addCell(createValueCell(booking.getSelectedHotel().getName()));
                hotelTable.addCell(createLabelCell("Address"));
                hotelTable.addCell(createValueCell(booking.getSelectedHotel().getAddress()));
                if (booking.getSelectedHotel().getCheckInTime() != null) {
                    hotelTable.addCell(createLabelCell("Check-in"));
                    hotelTable.addCell(createValueCell(booking.getSelectedHotel().getCheckInTime().toString()));
                }
                if (booking.getSelectedHotel().getCheckOutTime() != null) {
                    hotelTable.addCell(createLabelCell("Check-out"));
                    hotelTable.addCell(createValueCell(booking.getSelectedHotel().getCheckOutTime().toString()));
                }
                hotelTable.addCell(createLabelCell("Room Type"));
                hotelTable.addCell(createValueCell(booking.getSelectedRoomType()));
                hotelTable.addCell(createLabelCell("Rate"));
                hotelTable.addCell(createValueCell("₹" + booking.getHotelPricePerNight() + " × " + booking.getHotelNights() + " nights"));
                document.add(hotelTable);
                document.add(Chunk.NEWLINE);
            }

            // Total Amount
            // Separator line
            document.add(Chunk.NEWLINE);

            Paragraph totalLabel = new Paragraph("TOTAL AMOUNT", HEADER_FONT);
            totalLabel.setSpacingBefore(8);
            document.add(totalLabel);

            Paragraph totalAmount = new Paragraph("₹" + booking.getTotalAmount(), AMOUNT_FONT);
            totalAmount.setSpacingAfter(16);
            document.add(totalAmount);

            // Footer
            Paragraph footer = new Paragraph(
                "This is a system-generated ticket. Please present this at check-in.\n" +
                "For support, contact: support@sunrise.com | +91-1800-123-4567",
                SMALL_FONT
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            log.error("Failed to generate ticket PDF for booking {}: {}", booking.getBookingReference(), e.getMessage());
            throw new RuntimeException("Failed to generate ticket PDF", e);
        }

        return baos.toByteArray();
    }

    private Paragraph createSectionHeader(String text) {
        Paragraph header = new Paragraph(text, HEADER_FONT);
        header.setSpacingAfter(8);
        return header;
    }

    private PdfPTable createTwoColumnTable() {
        PdfPTable table = new PdfPTable(new float[]{1f, 2.5f});
        table.setWidthPercentage(100);
        table.setSpacingAfter(4);
        return table;
    }

    private PdfPCell createLabelCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, SMALL_FONT));
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setPadding(4);
        cell.setBackgroundColor(new java.awt.Color(245, 242, 235));
        return cell;
    }

    private PdfPCell createValueCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "—", BODY_FONT));
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setPadding(4);
        return cell;
    }
}
