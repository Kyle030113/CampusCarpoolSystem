package com.cityu_dg._5003.service;

import com.cityu_dg._5003.entity.Carpool;
import com.cityu_dg._5003.req.carpool.CarpoolJoinReq;
import com.cityu_dg._5003.req.carpool.CarpoolPublishReq;
import com.cityu_dg._5003.resp.CommonResp;

public interface CarpoolService {
    CommonResp publish(CarpoolPublishReq req);
    CommonResp browse(String origin, String destination);
    CommonResp history(String userId);
    CommonResp finish(String carpoolId);
    CommonResp join(CarpoolJoinReq req);
}
