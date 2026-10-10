package com.sssp.application.dto;

public class ApplicationRequest {
    private Long tournamentId;
    private String notes;

    public ApplicationRequest() {}

    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
