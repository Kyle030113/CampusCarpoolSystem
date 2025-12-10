package com.cityu_dg._5003.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@TableName("participant")
public class Participant {
    private String participantId;
    private String carpoolId;
    private String userId;
}
