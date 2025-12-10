package com.cityu_dg._5003.req.carpool;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class CarpoolPublishReq {
    private String userId;
    private String origin;
    private String originDetail;
    private String destination;
    private String destinationDetail;
    private LocalDateTime departureTime;
    private String remarks;
}
