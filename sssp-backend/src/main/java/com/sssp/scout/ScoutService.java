package com.sssp.scout;

import com.sssp.alert.ScoutAlert;

import com.sssp.user.User;
import com.sssp.user.UserRepository;
import com.sssp.common.enums.AlertTriggerType;
import com.sssp.common.enums.ProfileVisibility;
import com.sssp.common.exception.ResourceNotFoundException;
import com.sssp.common.exception.UnauthorizedException;
import com.sssp.gpi.GPIRecord;
import com.sssp.gpi.GPIRecordRepository;
import com.sssp.match.Match;
import com.sssp.match.MatchRepository;
import com.sssp.player.PlayerProfile;
import com.sssp.player.PlayerProfileRepository;
import com.sssp.ranking.RankingRecordRepository;
import com.sssp.scout.dto.*;
import com.sssp.scout.repository.*;
import com.sssp.stats.repository.PlayerMatchStatisticsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ScoutService {

    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final GPIRecordRepository gpiRecordRepository;
    private final RankingRecordRepository rankingRecordRepository;
    private final ScoutShortlistRepository scoutShortlistRepository;
    private final ScoutNoteRepository scoutNoteRepository;
    private final ScoutObservationRepository scoutObservationRepository;
    private final ScoutFilterRepository scoutFilterRepository;
    private final ScoutAlertRepository scoutAlertRepository;
    private final MatchRepository matchRepository;
    private final PlayerMatchStatisticsRepository playerMatchStatisticsRepository;

    public ScoutService(UserRepository userRepository, PlayerProfileRepository playerProfileRepository, GPIRecordRepository gpiRecordRepository, RankingRecordRepository rankingRecordRepository, ScoutShortlistRepository scoutShortlistRepository, ScoutNoteRepository scoutNoteRepository, ScoutObservationRepository scoutObservationRepository, ScoutFilterRepository scoutFilterRepository, ScoutAlertRepository scoutAlertRepository, MatchRepository matchRepository, PlayerMatchStatisticsRepository playerMatchStatisticsRepository) {
        this.userRepository = userRepository;
        this.playerProfileRepository = playerProfileRepository;
        this.gpiRecordRepository = gpiRecordRepository;
        this.rankingRecordRepository = rankingRecordRepository;
        this.scoutShortlistRepository = scoutShortlistRepository;
        this.scoutNoteRepository = scoutNoteRepository;
        this.scoutObservationRepository = scoutObservationRepository;
        this.scoutFilterRepository = scoutFilterRepository;
        this.scoutAlertRepository = scoutAlertRepository;
        this.matchRepository = matchRepository;
        this.playerMatchStatisticsRepository = playerMatchStatisticsRepository;
    }

    public List<PlayerSearchResponse> searchPlayers(PlayerSearchRequest request) {
        List<PlayerProfile> profiles = playerProfileRepository.findAll().stream()
                .filter(p -> p.getVisibility() == ProfileVisibility.PUBLIC || p.getVisibility() == ProfileVisibility.RESTRICTED)
                .collect(Collectors.toList());

        if (request.getQuery() != null && !request.getQuery().isBlank()) {
            String q = request.getQuery().trim().toLowerCase();
            profiles = profiles.stream().filter(p -> 
                (p.getFullName() != null && p.getFullName().toLowerCase().contains(q)) ||
                (p.getUser() != null && p.getUser().getUsername() != null && p.getUser().getUsername().toLowerCase().contains(q)) ||
                (p.getTeamAcademy() != null && p.getTeamAcademy().toLowerCase().contains(q)) ||
                (p.getLocation() != null && p.getLocation().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }

        if (request.getPosition() != null && !request.getPosition().isEmpty()) {
            String[] posTokens = request.getPosition().split(",");
            profiles = profiles.stream().filter(p -> {
                for (String pos : posTokens) {
                    String clean = pos.trim();
                    if (clean.equalsIgnoreCase(p.getPrimaryPosition()) || 
                       (p.getPositionCategory() != null && clean.equalsIgnoreCase(p.getPositionCategory().name()))) {
                        return true;
                    }
                }
                return false;
            }).collect(Collectors.toList());
        }
        if (request.getLocation() != null && !request.getLocation().isEmpty()) {
            profiles = profiles.stream().filter(p -> p.getLocation() != null && p.getLocation().toLowerCase().contains(request.getLocation().toLowerCase())).collect(Collectors.toList());
        }
        if (request.getAgeGroup() != null && !request.getAgeGroup().isEmpty()) {
            profiles = profiles.stream().filter(p -> {
                if (p.getDateOfBirth() == null) return false;
                int age = Period.between(p.getDateOfBirth(), LocalDate.now()).getYears();
                if(request.getAgeGroup().startsWith("U")) {
                    try {
                        int max = Integer.parseInt(request.getAgeGroup().substring(1));
                        return age <= max;
                    } catch(Exception e) {}
                }
                return true;
            }).collect(Collectors.toList());
        }
        if (request.getTeamAcademy() != null && !request.getTeamAcademy().isEmpty()) {
            profiles = profiles.stream().filter(p -> p.getTeamAcademy() != null && p.getTeamAcademy().toLowerCase().contains(request.getTeamAcademy().toLowerCase())).collect(Collectors.toList());
        }

        // Players that have a GPI record; players without one are excluded by any GPI / match-count filter.
        Set<Long> playersWithGpi = new HashSet<>();
        List<PlayerSearchResponse> responses = new ArrayList<>();
        for (PlayerProfile p : profiles) {
            Long playerId = p.getUser().getId();
            PlayerSearchResponse res = new PlayerSearchResponse();
            res.setPlayerId(playerId);
            res.setId(playerId);
            String displayName = p.getFullName() != null && !p.getFullName().isBlank() ? p.getFullName() : p.getUser().getUsername();
            res.setPlayerName(displayName);
            res.setName(displayName);
            res.setPrimaryPosition(p.getPrimaryPosition());
            res.setPosition(p.getPrimaryPosition());
            res.setPositionCategory(p.getPositionCategory() != null ? p.getPositionCategory().name() : null);
            res.setLocation(p.getLocation());
            res.setTeamAcademy(p.getTeamAcademy());
            res.setTeam(p.getTeamAcademy());
            res.setPhotoUrl(p.getPhotoUrl());
            res.setAge(p.getDateOfBirth() != null ? Period.between(p.getDateOfBirth(), LocalDate.now()).getYears() : 0);

            GPIRecord gpi = gpiRecordRepository.findTopByPlayerIdOrderByComputedAtDesc(playerId).orElse(null);
            if (gpi != null) {
                playersWithGpi.add(playerId);
                res.setGpi(gpi.getGpi());
                res.setVerifiedMatches(gpi.getMatchesConsidered());
                res.setDataConfidence(gpi.getDataConfidence() != null ? gpi.getDataConfidence().name() : null);
                res.setRecentForm(gpi.getRecentForm());
                res.setRankingEligible(gpi.isRankingEligible());
            }
            responses.add(res);
        }

        if (request.getMinGpi() != null) responses = responses.stream().filter(r -> playersWithGpi.contains(r.getPlayerId()) && r.getGpi() >= request.getMinGpi()).collect(Collectors.toList());
        if (request.getMaxGpi() != null) responses = responses.stream().filter(r -> playersWithGpi.contains(r.getPlayerId()) && r.getGpi() <= request.getMaxGpi()).collect(Collectors.toList());
        if (request.getMinMatches() != null) responses = responses.stream().filter(r -> playersWithGpi.contains(r.getPlayerId()) && r.getVerifiedMatches() >= request.getMinMatches()).collect(Collectors.toList());
        if (request.getDataConfidence() != null && !request.getDataConfidence().isEmpty()) responses = responses.stream().filter(r -> request.getDataConfidence().equalsIgnoreCase(r.getDataConfidence())).collect(Collectors.toList());

        String sortBy = request.getSortBy() != null ? request.getSortBy() : "gpi";
        boolean asc = "asc".equalsIgnoreCase(request.getSortDir());

        Comparator<PlayerSearchResponse> comp;
        switch (sortBy) {
            case "recentForm": comp = Comparator.comparingDouble(PlayerSearchResponse::getRecentForm); break;
            case "matches": comp = Comparator.comparingInt(PlayerSearchResponse::getVerifiedMatches); break;
            default: comp = Comparator.comparingDouble(PlayerSearchResponse::getGpi); break;
        }
        if(!asc) comp = comp.reversed();
        responses.sort(comp);

        return responses;
    }

    public ShortlistResponse addToShortlist(Long playerId, ShortlistRequest request, String username) {
        User scout = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Scout not found"));
        User player = userRepository.findById(playerId).orElseThrow(() -> new ResourceNotFoundException("Player not found"));
        
        ScoutShortlist list = scoutShortlistRepository.findByScoutIdAndPlayerId(scout.getId(), playerId)
                .orElse(new ScoutShortlist());
        list.setScout(scout);
        list.setPlayer(player);
        list.setPriority(request.getPriority());
        list.setNote(request.getNote());
        
        return mapToShortlistResponse(scoutShortlistRepository.save(list));
    }

    public void removeFromShortlist(Long playerId, String username) {
        User scout = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Scout not found"));
        scoutShortlistRepository.findByScoutIdAndPlayerId(scout.getId(), playerId).ifPresent(scoutShortlistRepository::delete);
    }

    public List<ShortlistResponse> getShortlist(String username) {
        User scout = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Scout not found"));
        return scoutShortlistRepository.findByScoutId(scout.getId()).stream().map(this::mapToShortlistResponse).collect(Collectors.toList());
    }

    public ScoutNoteResponse addNote(Long playerId, ScoutNoteRequest request, String username) {
        User scout = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Scout not found"));
        User player = userRepository.findById(playerId).orElseThrow(() -> new ResourceNotFoundException("Player not found"));
        
        ScoutNote note = new ScoutNote();
        note.setScout(scout);
        note.setPlayer(player);
        note.setNote(request.getNote());
        note.setNotedAt(LocalDateTime.now());
        
        return mapToScoutNoteResponse(scoutNoteRepository.save(note));
    }

    public List<ScoutNoteResponse> getNotes(Long playerId, String username) {
        User scout = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Scout not found"));
        return scoutNoteRepository.findByScoutIdAndPlayerId(scout.getId(), playerId).stream().map(this::mapToScoutNoteResponse).collect(Collectors.toList());
    }

    public ObservationResponse submitObservation(Long playerId, ObservationRequest request, String username) {
        User evaluator = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Evaluator not found"));
        if (!evaluator.isEvaluatorPermission()) {
            throw new UnauthorizedException("Evaluator permission required");
        }
        User player = userRepository.findById(playerId).orElseThrow(() -> new ResourceNotFoundException("Player not found"));
        Match match = request.getMatchId() != null ? matchRepository.findById(request.getMatchId()).orElse(null) : null;

        ScoutObservation obs = new ScoutObservation();
        obs.setEvaluator(evaluator);
        obs.setPlayer(player);
        obs.setMatch(match);
        obs.setTechnicalRating(request.getTechnicalRating());
        obs.setTacticalRating(request.getTacticalRating());
        obs.setPhysicalRating(request.getPhysicalRating());
        obs.setPsychosocialRating(request.getPsychosocialRating());
        obs.setComments(request.getComments());
        obs.setObservedAt(LocalDateTime.now());
        
        return mapToObservationResponse(scoutObservationRepository.save(obs));
    }

    public List<ObservationResponse> getObservations(Long playerId) {
        return scoutObservationRepository.findByPlayerId(playerId).stream().map(this::mapToObservationResponse).collect(Collectors.toList());
    }

    public ScoutFilterResponse saveFilter(ScoutFilterRequest request, String username) {
        User scout = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Scout not found"));
        ScoutFilter filter = new ScoutFilter();
        filter.setScout(scout);
        filter.setName(request.getName());
        filter.setCriteriaJson(request.getCriteriaJson());
        return mapToScoutFilterResponse(scoutFilterRepository.save(filter));
    }

    public List<ScoutFilterResponse> getFilters(String username) {
        User scout = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Scout not found"));
        return scoutFilterRepository.findByScoutId(scout.getId()).stream().map(this::mapToScoutFilterResponse).collect(Collectors.toList());
    }

    public void deleteFilter(Long filterId, String username) {
        User scout = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Scout not found"));
        ScoutFilter filter = scoutFilterRepository.findById(filterId).orElseThrow(() -> new ResourceNotFoundException("Filter not found"));
        if (!filter.getScout().getId().equals(scout.getId())) throw new UnauthorizedException("Not owner");
        scoutFilterRepository.delete(filter);
    }

    public List<ScoutAlertResponse> getAlerts(String username) {
        User scout = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Scout not found"));
        return scoutAlertRepository.findByScoutIdOrderByAlertCreatedAtDesc(scout.getId()).stream().map(this::mapToScoutAlertResponse).collect(Collectors.toList());
    }

    public void markAlertRead(Long alertId, String username) {
        User scout = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Scout not found"));
        ScoutAlert alert = scoutAlertRepository.findById(alertId).orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        if (!alert.getScout().getId().equals(scout.getId())) throw new UnauthorizedException("Not owner");
        alert.setRead(true);
        scoutAlertRepository.save(alert);
    }

    public void createAlertForPlayer(Long playerId, AlertTriggerType reason) {
        // MVP logic: just create an alert for all scouts if it matches basic
    }

    private String displayName(User user) {
        return playerProfileRepository.findByUserId(user.getId())
                .map(PlayerProfile::getFullName)
                .filter(name -> name != null && !name.isBlank())
                .orElse(user.getUsername());
    }

    private ShortlistResponse mapToShortlistResponse(ScoutShortlist s) {
        ShortlistResponse r = new ShortlistResponse();
        r.setId(s.getId());
        r.setPlayerId(s.getPlayer().getId());
        r.setPlayerName(displayName(s.getPlayer()));
        r.setScoutId(s.getScout().getId());
        playerProfileRepository.findByUserId(s.getPlayer().getId()).ifPresent(p -> r.setPosition(p.getPrimaryPosition()));
        gpiRecordRepository.findTopByPlayerIdOrderByComputedAtDesc(s.getPlayer().getId()).ifPresent(g -> r.setGpi(g.getGpi()));
        r.setPriority(s.getPriority());
        r.setNote(s.getNote());
        return r;
    }

    private ScoutNoteResponse mapToScoutNoteResponse(ScoutNote n) {
        ScoutNoteResponse r = new ScoutNoteResponse();
        r.setId(n.getId());
        r.setPlayerId(n.getPlayer().getId());
        r.setPlayerName(displayName(n.getPlayer()));
        r.setScoutId(n.getScout().getId());
        r.setNote(n.getNote());
        r.setNotedAt(n.getNotedAt());
        return r;
    }

    private ObservationResponse mapToObservationResponse(ScoutObservation o) {
        ObservationResponse r = new ObservationResponse();
        r.setId(o.getId());
        r.setPlayerId(o.getPlayer().getId());
        r.setPlayerName(displayName(o.getPlayer()));
        r.setEvaluatorId(o.getEvaluator().getId());
        r.setEvaluatorName(o.getEvaluator().getUsername());
        if(o.getMatch() != null) r.setMatchId(o.getMatch().getId());
        r.setTechnicalRating(o.getTechnicalRating());
        r.setTacticalRating(o.getTacticalRating());
        r.setPhysicalRating(o.getPhysicalRating());
        r.setPsychosocialRating(o.getPsychosocialRating());
        r.setComments(o.getComments());
        r.setObservedAt(o.getObservedAt());
        return r;
    }

    private ScoutFilterResponse mapToScoutFilterResponse(ScoutFilter f) {
        ScoutFilterResponse r = new ScoutFilterResponse();
        r.setId(f.getId());
        r.setScoutId(f.getScout().getId());
        r.setName(f.getName());
        r.setCriteriaJson(f.getCriteriaJson());
        r.setCreatedAt(f.getCreatedAt());
        return r;
    }

    private ScoutAlertResponse mapToScoutAlertResponse(ScoutAlert a) {
        ScoutAlertResponse r = new ScoutAlertResponse();
        r.setId(a.getId());
        r.setScoutId(a.getScout().getId());
        if (a.getFilter() != null) {
            r.setFilterId(a.getFilter().getId());
            r.setFilterName(a.getFilter().getName());
        }
        r.setPlayerId(a.getPlayer().getId());
        r.setPlayerName(displayName(a.getPlayer()));
        r.setTriggerReason(a.getTriggerReason());
        r.setAlertCreatedAt(a.getAlertCreatedAt());
        r.setRead(a.isRead());
        return r;
    }
}
