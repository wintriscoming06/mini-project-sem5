package com.sssp.scout;

import com.sssp.user.User;
import com.sssp.user.UserRepository;
import com.sssp.user.ScoutProfile;
import com.sssp.user.ScoutProfileRepository;
import com.sssp.common.enums.AlertTriggerType;
import com.sssp.common.enums.ProfileVisibility;
import com.sssp.common.enums.UserRole;
import com.sssp.common.exception.BadRequestException;
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
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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
    private final MatchRepository matchRepository;
    private final PlayerMatchStatisticsRepository playerMatchStatisticsRepository;
    private final ScoutProfileRepository scoutProfileRepository;
    private final ScoutContactRequestRepository scoutContactRequestRepository;

    public ScoutService(UserRepository userRepository,
                        PlayerProfileRepository playerProfileRepository,
                        GPIRecordRepository gpiRecordRepository,
                        RankingRecordRepository rankingRecordRepository,
                        ScoutShortlistRepository scoutShortlistRepository,
                        ScoutNoteRepository scoutNoteRepository,
                        ScoutObservationRepository scoutObservationRepository,
                        ScoutFilterRepository scoutFilterRepository,
                        MatchRepository matchRepository,
                        PlayerMatchStatisticsRepository playerMatchStatisticsRepository,
                        ScoutProfileRepository scoutProfileRepository,
                        ScoutContactRequestRepository scoutContactRequestRepository) {
        this.userRepository = userRepository;
        this.playerProfileRepository = playerProfileRepository;
        this.gpiRecordRepository = gpiRecordRepository;
        this.rankingRecordRepository = rankingRecordRepository;
        this.scoutShortlistRepository = scoutShortlistRepository;
        this.scoutNoteRepository = scoutNoteRepository;
        this.scoutObservationRepository = scoutObservationRepository;
        this.scoutFilterRepository = scoutFilterRepository;
        this.matchRepository = matchRepository;
        this.playerMatchStatisticsRepository = playerMatchStatisticsRepository;
        this.scoutProfileRepository = scoutProfileRepository;
        this.scoutContactRequestRepository = scoutContactRequestRepository;
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
                String playerPos = p.getPrimaryPosition() != null ? p.getPrimaryPosition().trim() : "";
                for (String pos : posTokens) {
                    String clean = pos.trim();
                    if (clean.equalsIgnoreCase(playerPos)) return true;
                    if (p.getPositionCategory() != null && clean.equalsIgnoreCase(p.getPositionCategory().name())) return true;
                    // Tactical role alias equivalence: DM <-> CDM, AM <-> CAM, ST <-> CF
                    if ("DM".equalsIgnoreCase(clean) && "CDM".equalsIgnoreCase(playerPos)) return true;
                    if ("CDM".equalsIgnoreCase(clean) && "DM".equalsIgnoreCase(playerPos)) return true;
                    if ("AM".equalsIgnoreCase(clean) && "CAM".equalsIgnoreCase(playerPos)) return true;
                    if ("CAM".equalsIgnoreCase(clean) && "AM".equalsIgnoreCase(playerPos)) return true;
                    if ("ST".equalsIgnoreCase(clean) && "CF".equalsIgnoreCase(playerPos)) return true;
                    if ("CF".equalsIgnoreCase(clean) && "ST".equalsIgnoreCase(playerPos)) return true;
                    // Midfield wide equivalences if queried as MID
                    if ("MID".equalsIgnoreCase(clean) && ("LM".equalsIgnoreCase(playerPos) || "RM".equalsIgnoreCase(playerPos) || "CM".equalsIgnoreCase(playerPos) || "DM".equalsIgnoreCase(playerPos) || "AM".equalsIgnoreCase(playerPos))) return true;
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
        String teamFilter = request.getTeam() != null && !request.getTeam().isEmpty()
                ? request.getTeam() : request.getTeamAcademy();
        if (teamFilter != null && !teamFilter.isEmpty()) {
            profiles = profiles.stream().filter(p -> p.getTeamAcademy() != null && p.getTeamAcademy().toLowerCase().contains(teamFilter.toLowerCase())).collect(Collectors.toList());
        }

        // Players that have a GPI record; players without one are excluded by any GPI / match-count filter.
        // Optimization: Batch fetch latest GPI records for all candidates in one round-trip (O(M) lookup, eliminating N+1 queries).
        List<Long> playerIds = profiles.stream().map(p -> p.getUser().getId()).collect(Collectors.toList());
        Map<Long, GPIRecord> latestGpiMap = new HashMap<>();
        if (!playerIds.isEmpty()) {
            List<GPIRecord> batchRecords = gpiRecordRepository.findLatestByPlayerIds(playerIds);
            for (GPIRecord rec : batchRecords) {
                if (rec.getPlayer() != null) {
                    latestGpiMap.put(rec.getPlayer().getId(), rec);
                }
            }
        }

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

            GPIRecord gpi = latestGpiMap.get(playerId);
            double effectiveGpi = gpi != null ? gpi.getGpi() : (p.getCurrentGpi() != null ? p.getCurrentGpi() : (double) p.getOverallRating());
            int matches = gpi != null ? gpi.getMatchesConsidered() : p.getCompetitiveMatches();
            String confidence = gpi != null && gpi.getDataConfidence() != null ? gpi.getDataConfidence().name() : (matches < 2 ? "LOW" : (matches < 5 ? "MEDIUM" : "HIGH"));
            double form = gpi != null ? gpi.getRecentForm() : 75.0;
            boolean eligible = gpi != null ? gpi.isRankingEligible() : p.isGpiEligible();

            res.setGpi(effectiveGpi);
            res.setVerifiedMatches(matches);
            res.setDataConfidence(confidence);
            res.setRecentForm(form);
            res.setRankingEligible(eligible);
            playersWithGpi.add(playerId);
            responses.add(res);
        }

        if (request.getMinGpi() != null) responses = responses.stream().filter(r -> r.getGpi() >= request.getMinGpi()).collect(Collectors.toList());
        if (request.getMaxGpi() != null) responses = responses.stream().filter(r -> r.getGpi() <= request.getMaxGpi()).collect(Collectors.toList());
        if (request.getMinMatches() != null) responses = responses.stream().filter(r -> r.getVerifiedMatches() >= request.getMinMatches()).collect(Collectors.toList());
        if (request.getDataConfidence() != null && !request.getDataConfidence().isEmpty()) responses = responses.stream().filter(r -> request.getDataConfidence().equalsIgnoreCase(r.getDataConfidence())).collect(Collectors.toList());

        String sortBy = request.getSortBy() != null ? request.getSortBy() : "gpi";
        boolean asc = "asc".equalsIgnoreCase(request.getSortDir());

        Comparator<PlayerSearchResponse> comp;
        if ("recent_form".equalsIgnoreCase(sortBy) || "recentForm".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparingDouble(PlayerSearchResponse::getRecentForm);
        } else if ("matches_played".equalsIgnoreCase(sortBy) || "matches".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparingInt(PlayerSearchResponse::getVerifiedMatches);
        } else {
            comp = Comparator.comparingDouble(PlayerSearchResponse::getGpi);
        }
        if(!asc) comp = comp.reversed();
        responses.sort(comp);

        if (request.getPage() != null && request.getSize() != null && request.getSize() > 0) {
            int page = Math.max(0, request.getPage());
            int fromIndex = page * request.getSize();
            if (fromIndex >= responses.size()) {
                return Collections.emptyList();
            }
            int toIndex = Math.min(fromIndex + request.getSize(), responses.size());
            return responses.subList(fromIndex, toIndex);
        }

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

        // Also update the note on the scout's shortlist entry if present
        scoutShortlistRepository.findByScoutIdAndPlayerId(scout.getId(), playerId).ifPresent(sl -> {
            sl.setNote(request.getNote());
            scoutShortlistRepository.save(sl);
        });
        
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

    public List<ObservationResponse> getObservationsByEvaluator(String username) {
        User scout = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("Scout not found"));
        return scoutObservationRepository.findByEvaluator(scout).stream().map(this::mapToObservationResponse).collect(Collectors.toList());
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

    // ==========================================
    // Scout Profile & Contact Number Management
    // ==========================================
    public ScoutProfileDto getScoutProfile(String username) {
        User scout = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Scout user not found: " + username));
        ScoutProfile profile = scoutProfileRepository.findByUserId(scout.getId())
                .orElseGet(() -> scoutProfileRepository.save(
                        ScoutProfile.builder()
                                .user(scout)
                                .organization("Independent Scout")
                                .affiliation("Pro Scouting Network")
                                .build()
                ));
        return mapToScoutProfileDto(profile, scout);
    }

    public ScoutProfileDto updateScoutProfile(String username, ScoutProfileUpdateRequest request) {
        User scout = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Scout user not found: " + username));
        ScoutProfile profile = scoutProfileRepository.findByUserId(scout.getId())
                .orElseGet(() -> ScoutProfile.builder().user(scout).build());

        if (request.getOrganization() != null && !request.getOrganization().isBlank()) {
            profile.setOrganization(request.getOrganization().trim());
        }
        if (request.getAffiliation() != null && !request.getAffiliation().isBlank()) {
            profile.setAffiliation(request.getAffiliation().trim());
        }
        if (request.getPhoneNumber() != null) {
            String trimmed = request.getPhoneNumber().trim();
            if (!trimmed.isEmpty()) {
                validatePhoneNumber(trimmed);
                profile.setPhoneNumber(trimmed);
            } else {
                profile.setPhoneNumber(null);
            }
        }

        return mapToScoutProfileDto(scoutProfileRepository.save(profile), scout);
    }

    // ==========================================
    // Scout Contact Requests (Send & View)
    // ==========================================
    public ContactRequestResponse sendContactRequest(Long playerId, ContactRequestCreateRequest request, String scoutUsername) {
        User scout = userRepository.findByUsername(scoutUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Scout not found"));
        if (scout.getRole() != UserRole.SCOUT) {
            throw new UnauthorizedException("Only scouts can send contact requests");
        }

        ScoutProfile scoutProfile = scoutProfileRepository.findByUserId(scout.getId())
                .orElseGet(() -> scoutProfileRepository.save(
                        ScoutProfile.builder()
                                .user(scout)
                                .organization("Independent Scout")
                                .affiliation("Pro Scouting Network")
                                .build()
                ));

        String phone = scoutProfile.getPhoneNumber();
        if (phone == null || phone.isBlank()) {
            throw new BadRequestException("You must save a valid mobile contact number in your scout profile before sending contact requests to players");
        }

        User player = userRepository.findById(playerId)
                .or(() -> playerProfileRepository.findById(playerId).map(PlayerProfile::getUser))
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with ID: " + playerId));
        if (player.getRole() != UserRole.PLAYER) {
            throw new BadRequestException("Target user is not a player");
        }

        String message = request != null && request.getMessage() != null ? request.getMessage().trim() : "";
        if (message.isEmpty()) {
            throw new BadRequestException("Please include a brief message explaining your scouting interest");
        }
        if (message.length() > 1000) {
            throw new BadRequestException("Message cannot exceed 1000 characters");
        }

        // Prevent accidental duplicate pending requests from same scout to same player
        if (scoutContactRequestRepository.existsByScoutIdAndPlayerIdAndStatus(scout.getId(), player.getId(), ContactRequestStatus.PENDING)) {
            throw new BadRequestException("You already have an active pending contact request sent to this player");
        }

        String scoutFullName = request != null && request.getScoutName() != null && !request.getScoutName().isBlank()
                ? request.getScoutName().trim()
                : scout.getUsername();

        ScoutContactRequest entity = ScoutContactRequest.builder()
                .scout(scout)
                .player(player)
                .message(message)
                .scoutContactNumber(phone)
                .scoutOrganization(scoutProfile.getOrganization() != null ? scoutProfile.getOrganization() : "Independent Scouting")
                .scoutName(scoutFullName)
                .status(ContactRequestStatus.PENDING)
                .build();

        return mapToContactRequestResponse(scoutContactRequestRepository.save(entity));
    }

    public List<ContactRequestResponse> getPlayerIncomingContactRequests(String playerUsername) {
        User player = userRepository.findByUsername(playerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Player user not found"));
        if (player.getRole() != UserRole.PLAYER) {
            throw new UnauthorizedException("Only players can access incoming scouting requests");
        }
        return scoutContactRequestRepository.findByPlayerIdOrderByCreatedAtDesc(player.getId()).stream()
                .map(this::mapToContactRequestResponse)
                .collect(Collectors.toList());
    }

    public ContactRequestResponse updateContactRequestStatus(Long requestId, ContactRequestStatus status, String playerUsername) {
        User player = userRepository.findByUsername(playerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Player user not found"));
        ScoutContactRequest req = scoutContactRequestRepository.findByIdAndPlayerId(requestId, player.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Scouting request not found or does not belong to you"));

        req.setStatus(status);
        return mapToContactRequestResponse(scoutContactRequestRepository.save(req));
    }

    private void validatePhoneNumber(String number) {
        // Support common formats: +1234567890, +91 9876543210, 0987654321, 98765-43210, etc. (min 7 digits, max 20)
        String digitsOnly = number.replaceAll("[^0-9]", "");
        if (digitsOnly.length() < 7 || digitsOnly.length() > 15) {
            throw new BadRequestException("Please enter a valid phone/mobile number (between 7 and 15 digits)");
        }
        if (!number.matches("^[+]?[0-9\\s\\-\\(\\)]{7,25}$")) {
            throw new BadRequestException("Phone number format is invalid");
        }
    }

    private ScoutProfileDto mapToScoutProfileDto(ScoutProfile profile, User user) {
        return ScoutProfileDto.builder()
                .id(profile.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .organization(profile.getOrganization())
                .affiliation(profile.getAffiliation())
                .phoneNumber(profile.getPhoneNumber())
                .verified(profile.isVerified())
                .build();
    }

    private ContactRequestResponse mapToContactRequestResponse(ScoutContactRequest r) {
        return ContactRequestResponse.builder()
                .id(r.getId())
                .scoutId(r.getScout().getId())
                .scoutName(r.getScoutName() != null ? r.getScoutName() : r.getScout().getUsername())
                .scoutUsername(r.getScout().getUsername())
                .scoutOrganization(r.getScoutOrganization())
                .scoutContactNumber(r.getScoutContactNumber())
                .playerId(r.getPlayer().getId())
                .playerName(displayName(r.getPlayer()))
                .message(r.getMessage())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
