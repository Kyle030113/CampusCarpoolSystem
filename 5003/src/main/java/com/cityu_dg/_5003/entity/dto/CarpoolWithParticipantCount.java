package com.cityu_dg._5003.entity.dto;

import com.cityu_dg._5003.entity.User;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
public class CarpoolWithParticipantCount {
    private String carpoolId;
    private String userId;
    private String origin;
    private String originDetail;
    private String destination;
    private String destinationDetail;
    private LocalDateTime departureTime;
    private String remarks;
    private Integer status;
    private Integer participantCount;
}
