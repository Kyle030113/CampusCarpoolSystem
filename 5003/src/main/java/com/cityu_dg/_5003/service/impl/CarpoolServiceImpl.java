package com.cityu_dg._5003.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cityu_dg._5003.entity.Carpool;
import com.cityu_dg._5003.entity.Participant;
import com.cityu_dg._5003.entity.dto.CarpoolWithParticipant;
import com.cityu_dg._5003.entity.dto.CarpoolWithParticipantCount;
import com.cityu_dg._5003.mapper.CarpoolMapper;
import com.cityu_dg._5003.req.carpool.CarpoolJoinReq;
import com.cityu_dg._5003.req.carpool.CarpoolPublishReq;
import com.cityu_dg._5003.resp.CommonResp;
import com.cityu_dg._5003.service.CarpoolService;
import com.cityu_dg._5003.utils.copyUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
public class CarpoolServiceImpl extends ServiceImpl<CarpoolMapper, Carpool> implements CarpoolService {

    @Autowired
    private CarpoolMapper carpoolMapper;

    public CommonResp publish(CarpoolPublishReq req) {
        CommonResp resp = new CommonResp();
        Carpool carpool = copyUtil.copy(req, Carpool.class);
        carpool.setCarpoolId(UUID.randomUUID().toString());
        carpool.setStatus(1);
        carpoolMapper.insertCarpool(carpool);
        Participant participant = new Participant();
        participant.setParticipantId(UUID.randomUUID().toString());
        participant.setCarpoolId(carpool.getCarpoolId());
        participant.setUserId(carpool.getUserId());
        carpoolMapper.insertParticipant(participant);
        return resp;
    }

    public CommonResp browse(String origin, String destination) {
        CommonResp resp = new CommonResp();
        origin = (origin != null && origin.trim().length() > 0) ? origin.trim() : null;
        destination = (destination != null && destination.trim().length() > 0) ? destination.trim() : null;
        List<CarpoolWithParticipantCount> list = carpoolMapper.browseCarpools(origin, destination);
        resp.setContent(list);
        return resp;
    }

    public CommonResp history(String userId) {
        CommonResp resp = new CommonResp();
        List<CarpoolWithParticipant> list = carpoolMapper.historyCarpools(userId);
        List<CarpoolWithParticipant> ongoing = list.stream().filter(c -> c.getStatus() != null && c.getStatus() == 0).collect(Collectors.toList());
        List<CarpoolWithParticipant> finished = list.stream().filter(c -> c.getStatus() != null && c.getStatus() != 0).collect(Collectors.toList());
        Map<String, Object> content = new HashMap<>();
        content.put("ongoing", ongoing);
        content.put("finished", finished);
        resp.setContent(content);
        return resp;
    }

    public CommonResp finish(String carpoolId) {
        CommonResp resp = new CommonResp();
        carpoolMapper.finishCarpool(carpoolId);
        return resp;
    }

    public CommonResp join(CarpoolJoinReq req) {
        CommonResp resp = new CommonResp();
        Participant participant = copyUtil.copy(req, Participant.class);
        participant.setParticipantId(UUID.randomUUID().toString());
        carpoolMapper.insertParticipant(participant);
        return resp;
    }
}
