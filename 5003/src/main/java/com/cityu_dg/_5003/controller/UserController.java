package com.cityu_dg._5003.controller;

import com.cityu_dg._5003.req.user.UserLoginReq;
import com.cityu_dg._5003.resp.CommonResp;
import com.cityu_dg._5003.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("login")
    public CommonResp login(@RequestBody UserLoginReq req){
        System.out.println("UserLoginReq");
        System.out.println(req.toString());
        CommonResp resp=userService.login(req);
        return resp;
    }
}
