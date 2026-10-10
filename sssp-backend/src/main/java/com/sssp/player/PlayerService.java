package com.sssp.player;

import com.sssp.user.User;
import com.sssp.user.UserRepository;
import com.sssp.common.enums.PositionCategory;
import com.sssp.common.enums.ProfileVisibility;
import com.sssp.common.enums.UserRole;
import com.sssp.common.exception.BadRequestException;
import com.sssp.common.exception.ResourceNotFoundException;
import com.sssp.gpi.dto.GPIStatusResponse;
import com.sssp.gpi.GPIService;
import com.sssp.player.dto.AttributesUpdateRequest;
import com.sssp.player.dto.CardCustomizationRequest;
import com.sssp.player.dto.PlayerProfileRequest;
import com.sssp.player.dto.PlayerProfileResponse;
import com.sssp.player.PlayerProfile;
import com.sssp.player.PlayerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerProfileRepository playerProfileRepository;
    private final UserRepository userRepository;
    private final GPIService gpiService;

    public PlayerProfileResponse getProfile(Long id) {
        PlayerProfile profile = playerProfileRepository.findByUserId(id)
                .or(() -> playerProfileRepository.findById(id))
                .orElseThrow(() -> new ResourceNotFoundException("Player profile not found for user ID or Profile ID: " + id));
        return mapToResponse(profile);
    }

    public PlayerProfileResponse getMyProfile(String username) {
        return mapToResponse(resolveOwnProfile(username));
    }

    public PlayerProfileResponse updateMyProfile(String username, PlayerProfileRequest request) {
        User user = findPlayerUser(username);
        return updateProfile(user.getId(), request, username);
    }

    public Long getUserIdForUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return user.getId();
    }

    private User findPlayerUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        if (user.getRole() != UserRole.PLAYER) {
            throw new AccessDeniedException("Only players have a player profile");
        }
        return user;
    }

    private PlayerProfile resolveOwnProfile(String username) {
        User user = findPlayerUser(username);
        return playerProfileRepository.findByUserId(user.getId()).orElseGet(() -> {
            PlayerProfile created = new PlayerProfile();
            created.setUser(user);
            created.setVisibility(ProfileVisibility.PUBLIC);
            created.setFullName(user.getUsername());
            created.setCardDesign("Bronze");
            created.setCardTheme("light");
            return playerProfileRepository.save(created);
        });
    }

    public PlayerProfileResponse updateProfile(Long userId, PlayerProfileRequest request, String currentUsername) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        if (!user.getId().equals(userId) && user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.COACH && user.getRole() != UserRole.SCOUT) {
            throw new IllegalArgumentException("User does not own this profile");
        }

        PlayerProfile profile = playerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Player profile not found for user ID: " + userId));

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getPreferredFoot() != null) profile.setPreferredFoot(request.getPreferredFoot());
        if (request.getPrimaryPosition() != null) {
            profile.setPrimaryPosition(request.getPrimaryPosition());
            if (request.getPositionCategory() == null) {
                PositionCategory derived = deriveCategory(request.getPrimaryPosition());
                if (derived != null) profile.setPositionCategory(derived);
            }
        }
        if (request.getSecondaryPosition() != null) profile.setSecondaryPosition(request.getSecondaryPosition());
        if (request.getPositionCategory() != null) profile.setPositionCategory(PositionCategory.valueOf(request.getPositionCategory()));
        if (request.getTeamAcademy() != null) profile.setTeamAcademy(request.getTeamAcademy());
        if (request.getPhotoUrl() != null) profile.setPhotoUrl(request.getPhotoUrl());
        if (request.getBiography() != null) profile.setBiography(request.getBiography());
        if (request.getVisibility() != null) profile.setVisibility(ProfileVisibility.valueOf(request.getVisibility()));

        PlayerProfile savedProfile = playerProfileRepository.save(profile);
        return mapToResponse(savedProfile);
    }

    public PlayerProfileResponse updateCardCustomization(String username, CardCustomizationRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        PlayerProfile profile = playerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Player profile not found for: " + username));

        if (request.getDesign() != null && !request.getDesign().isBlank()) {
            profile.setCardDesign(request.getDesign());
        }
        if (request.getTheme() != null && !request.getTheme().isBlank()) {
            profile.setCardTheme(request.getTheme());
        }

        return mapToResponse(playerProfileRepository.save(profile));
    }

    public PlayerProfileResponse updateCardCustomizationById(Long playerId, CardCustomizationRequest request) {
        PlayerProfile profile = playerProfileRepository.findByUserId(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player profile not found for ID: " + playerId));

        if (request.getDesign() != null && !request.getDesign().isBlank()) {
            profile.setCardDesign(request.getDesign());
        }
        if (request.getTheme() != null && !request.getTheme().isBlank()) {
            profile.setCardTheme(request.getTheme());
        }

        return mapToResponse(playerProfileRepository.save(profile));
    }

    public PlayerProfileResponse updateAttributes(String username, AttributesUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return updateAttributesById(user.getId(), request);
    }

    public PlayerProfileResponse updateAttributesById(Long playerId, AttributesUpdateRequest request) {
        PlayerProfile profile = playerProfileRepository.findByUserId(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player profile not found for ID: " + playerId));

        if (profile.isGpiEligible()) {
            throw new AccessDeniedException("Performance attributes are calculated from competitive match performance and cannot be manually edited.");
        }

        validateAttribute("PAC", request.getPAC());
        validateAttribute("SHO", request.getSHO());
        validateAttribute("PAS", request.getPAS());
        validateAttribute("DRI", request.getDRI());
        validateAttribute("DEF", request.getDEF());
        validateAttribute("PHY", request.getPHY());

        if (request.getPAC() != null) { profile.setOrigPac(request.getPAC()); profile.setCurPac(request.getPAC()); }
        if (request.getSHO() != null) { profile.setOrigSho(request.getSHO()); profile.setCurSho(request.getSHO()); }
        if (request.getPAS() != null) { profile.setOrigPas(request.getPAS()); profile.setCurPas(request.getPAS()); }
        if (request.getDRI() != null) { profile.setOrigDri(request.getDRI()); profile.setCurDri(request.getDRI()); }
        if (request.getDEF() != null) { profile.setOrigDef(request.getDEF()); profile.setCurDef(request.getDEF()); }
        if (request.getPHY() != null) { profile.setOrigPhy(request.getPHY()); profile.setCurPhy(request.getPHY()); }

        int avg = (int) Math.round((profile.getCurPac() + profile.getCurSho() + profile.getCurPas()
                + profile.getCurDri() + profile.getCurDef() + profile.getCurPhy()) / 6.0);
        profile.setOverallRating(avg);

        return mapToResponse(playerProfileRepository.save(profile));
    }

    private void validateAttribute(String name, Integer val) {
        if (val != null && (val < 0 || val > 100)) {
            throw new BadRequestException(name + " must be a number between 0 and 100.");
        }
    }

    public List<PlayerProfileResponse> searchPlayers(String position, Double minGpi, Double maxGpi,
                                                     Integer minMatches, Integer minAge, Integer maxAge,
                                                     String team, String sortBy, String sortDir) {
        List<PlayerProfile> list = playerProfileRepository.findAll().stream()
                .filter(p -> p.getVisibility() == ProfileVisibility.PUBLIC || p.getVisibility() == ProfileVisibility.RESTRICTED)
                .collect(Collectors.toList());

        if (position != null && !position.isBlank()) {
            list = list.stream().filter(p -> position.equalsIgnoreCase(p.getPrimaryPosition())
                    || (p.getPositionCategory() != null && position.equalsIgnoreCase(p.getPositionCategory().name())))
                    .collect(Collectors.toList());
        }

        if (team != null && !team.isBlank()) {
            list = list.stream().filter(p -> p.getTeamAcademy() != null && p.getTeamAcademy().toLowerCase().contains(team.toLowerCase()))
                    .collect(Collectors.toList());
        }

        if (minMatches != null) {
            list = list.stream().filter(p -> p.getCompetitiveMatches() >= minMatches).collect(Collectors.toList());
        }

        if (minGpi != null) {
            list = list.stream().filter(p -> p.getCurrentGpi() != null && p.getCurrentGpi() >= minGpi).collect(Collectors.toList());
        }

        if (maxGpi != null) {
            list = list.stream().filter(p -> p.getCurrentGpi() != null && p.getCurrentGpi() <= maxGpi).collect(Collectors.toList());
        }

        if (minAge != null || maxAge != null) {
            list = list.stream().filter(p -> {
                if (p.getDateOfBirth() == null) return false;
                int age = Period.between(p.getDateOfBirth(), LocalDate.now()).getYears();
                if (minAge != null && age < minAge) return false;
                if (maxAge != null && age > maxAge) return false;
                return true;
            }).collect(Collectors.toList());
        }

        Comparator<PlayerProfile> comp = Comparator.comparing(p -> p.getCurrentGpi() != null ? p.getCurrentGpi() : (double) p.getOverallRating());
        if ("matches".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparingInt(PlayerProfile::getCompetitiveMatches);
        } else if ("rating".equalsIgnoreCase(sortBy)) {
            comp = Comparator.comparingInt(PlayerProfile::getOverallRating);
        }
        if (!"asc".equalsIgnoreCase(sortDir)) {
            comp = comp.reversed();
        }
        list.sort(comp);

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<PlayerProfileResponse> getAllProfiles() {
        return playerProfileRepository.findAll().stream()
                .filter(p -> p.getVisibility() == ProfileVisibility.PUBLIC)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PlayerProfileResponse getProfileByPlayerId(Long playerId) {
        PlayerProfile profile = playerProfileRepository.findByUserId(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player profile not found for player ID: " + playerId));
        return mapToResponse(profile);
    }

    private PositionCategory deriveCategory(String position) {
        switch (position.trim().toUpperCase()) {
            case "GK": return PositionCategory.GOALKEEPER;
            case "CB": case "LB": case "RB": return PositionCategory.DEFENDER;
            case "DM": case "CM": case "AM": case "CAM": case "CDM": case "LM": case "RM": return PositionCategory.MIDFIELDER;
            case "LW": case "RW": case "ST": case "CF": return PositionCategory.FORWARD;
            default: return null;
        }
    }

    public PlayerProfileResponse mapToResponse(PlayerProfile profile) {
        GPIStatusResponse gpiStatus = gpiService.getGPIStatus(profile.getUser().getId());

        int overall = profile.getOverallRating();
        if (gpiStatus.isEligible() && gpiStatus.getCurrentGPI() != null) {
            overall = (int) Math.round(gpiStatus.getCurrentGPI());
        }

        Map<String, Integer> origAttrs = new LinkedHashMap<>();
        origAttrs.put("PAC", profile.getOrigPac());
        origAttrs.put("SHO", profile.getOrigSho());
        origAttrs.put("PAS", profile.getOrigPas());
        origAttrs.put("DRI", profile.getOrigDri());
        origAttrs.put("DEF", profile.getOrigDef());
        origAttrs.put("PHY", profile.getOrigPhy());

        Map<String, Integer> curAttrs = new LinkedHashMap<>();
        curAttrs.put("PAC", profile.getCurPac());
        curAttrs.put("SHO", profile.getCurSho());
        curAttrs.put("PAS", profile.getCurPas());
        curAttrs.put("DRI", profile.getCurDri());
        curAttrs.put("DEF", profile.getCurDef());
        curAttrs.put("PHY", profile.getCurPhy());

        Map<String, Object> attrsObj = new LinkedHashMap<>();
        attrsObj.put("isLocked", gpiStatus.isEligible());
        attrsObj.put("original", origAttrs);
        attrsObj.put("current", curAttrs);

        Map<String, String> cardObj = new LinkedHashMap<>();
        cardObj.put("design", profile.getCardDesign() != null ? profile.getCardDesign() : "Bronze");
        cardObj.put("theme", profile.getCardTheme() != null ? profile.getCardTheme() : "light");

        return PlayerProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .username(profile.getUser().getUsername())
                .fullName(profile.getFullName())
                .dateOfBirth(profile.getDateOfBirth())
                .location(profile.getLocation())
                .preferredFoot(profile.getPreferredFoot())
                .primaryPosition(profile.getPrimaryPosition())
                .secondaryPosition(profile.getSecondaryPosition())
                .positionCategory(profile.getPositionCategory() != null ? profile.getPositionCategory().name() : null)
                .teamAcademy(profile.getTeamAcademy())
                .photoUrl(profile.getPhotoUrl())
                .biography(profile.getBiography())
                .visibility(profile.getVisibility() != null ? profile.getVisibility().name() : null)
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .overall(overall)
                .totalMatches(profile.getTotalMatches())
                .attributes(attrsObj)
                .card(cardObj)
                .gpi(gpiStatus)
                .build();
    }
}
