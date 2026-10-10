package com.sssp.gpi;

public interface MatchStatsInput {
    Integer getMinutesPlayed();
    int getGoals();
    int getAssists();
    int getShots();
    int getShotsOnTarget();
    int getPassesAttempted();
    int getPassesCompleted();
    int getKeyPasses();
    int getDribblesAttempted();
    int getDribblesCompleted();
    int getTackles();
    int getInterceptions();
    int getClearances();
    int getDuelsWon();
    int getYellowCards();
    int getRedCards();
    String getPosition();
    String getMatchKind();
    Integer getStars();
}
