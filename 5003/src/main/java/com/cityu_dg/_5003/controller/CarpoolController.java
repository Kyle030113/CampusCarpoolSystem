package com.cityu_dg._5003.controller;

import com.cityu_dg._5003.req.carpool.CarpoolJoinReq;
import com.cityu_dg._5003.req.carpool.CarpoolPublishReq;
import com.cityu_dg._5003.resp.CommonResp;
import com.cityu_dg._5003.service.CarpoolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/carpool")
public class CarpoolController {
    @Autowired
    private CarpoolService carpoolService;

    @PostMapping("publish")
    public CommonResp publish(@RequestBody CarpoolPublishReq req){
        System.out.println("CarpoolPublishReq");
        System.out.println(req.toString());
        CommonResp resp = carpoolService.publish(req);
        return resp;
    }

    @GetMapping("browse")
    public CommonResp browse(@RequestParam(required = false) String origin, @RequestParam(required = false) String destination){
        System.out.println("origin");
        System.out.println(origin);
        System.out.println("destination");
        System.out.println(destination);
        CommonResp resp = carpoolService.browse(origin, destination);
        return resp;
    }

    @GetMapping("/history")
    public CommonResp history(@RequestParam String userId) {
        System.out.println("userId");
        System.out.println(userId);
        CommonResp resp = carpoolService.history(userId);
        return resp;
    }

    @PostMapping("finish")
    public CommonResp finish(@RequestParam String carpoolId) {
        System.out.println("carpoolId");
        System.out.println(carpoolId);
        CommonResp resp = carpoolService.finish(carpoolId);
        return resp;
    }

    @PostMapping("join")
    public CommonResp join(@RequestBody CarpoolJoinReq req) {
        System.out.println("CarpoolJoinReq");
        System.out.println(req.toString());
        CommonResp resp = carpoolService.join(req);
        return resp;
    }
}
