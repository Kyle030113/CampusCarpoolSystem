package com.cityu_dg._5003.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cityu_dg._5003.entity.User;
import com.cityu_dg._5003.mapper.UserMapper;
import com.cityu_dg._5003.req.user.UserLoginReq;
import com.cityu_dg._5003.resp.CommonResp;
import com.cityu_dg._5003.service.UserService;
import com.cityu_dg._5003.utils.copyUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public CommonResp login(UserLoginReq req) {
        CommonResp resp = new CommonResp();
        User user = copyUtil.copy(req, User.class);
        User userDb = userMapper.getUserByOpenId(user.getOpenId());
        if (userDb == null) {
            user.setUserId(UUID.randomUUID().toString());
            userMapper.insert(user);
        }
        else {
            user.setUserId(userDb.getUserId());
        }
        resp.setContent(user);
        return resp;
    }
}
