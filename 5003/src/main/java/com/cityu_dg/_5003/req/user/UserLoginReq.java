package com.cityu_dg._5003.req.user;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UserLoginReq {
    private String openId;
    private String wechatNickname;
    private String avatarUrl;
    private String phoneNumber;
}
