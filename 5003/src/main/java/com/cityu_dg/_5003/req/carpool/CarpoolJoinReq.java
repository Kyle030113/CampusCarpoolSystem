package com.cityu_dg._5003.req.carpool;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CarpoolJoinReq {
    private String carpoolId;
    private String userId;
}
