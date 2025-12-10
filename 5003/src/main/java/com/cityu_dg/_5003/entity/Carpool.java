package com.cityu_dg._5003.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@TableName("carpool")
public class Carpool {
    private String carpoolId;
    private String userId;
    private String origin;
    private String originDetail;
    private String destination;
    private String destinationDetail;
    private LocalDateTime departureTime;
    private String remarks;
    private Integer status;
}
