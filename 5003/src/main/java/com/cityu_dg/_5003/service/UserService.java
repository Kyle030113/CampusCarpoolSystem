package com.cityu_dg._5003.service;

import com.cityu_dg._5003.req.user.UserLoginReq;
import com.cityu_dg._5003.resp.CommonResp;

public interface UserService {
    CommonResp login(UserLoginReq req);
}
