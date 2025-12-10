package com.cityu_dg._5003.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@TableName("user")
public class User {
    private String userId;
    private String openId;
    private String wechatNickname;
    private String avatarUrl;
    private String phoneNumber;
}
