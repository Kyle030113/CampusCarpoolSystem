package com.cityu_dg._5003.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cityu_dg._5003.entity.Carpool;
import com.cityu_dg._5003.entity.Participant;
import com.cityu_dg._5003.entity.User;
import com.cityu_dg._5003.entity.dto.CarpoolWithParticipant;
import com.cityu_dg._5003.entity.dto.CarpoolWithParticipantCount;
import com.cityu_dg._5003.mapper.provider.CarpoolSqlProvider;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface CarpoolMapper extends BaseMapper<Carpool> {

    @Insert("INSERT INTO carpool(carpool_id, user_id, origin, origin_detail, destination, destination_detail, departure_time, remarks, status) VALUES(#{carpoolId}, #{userId}, #{origin}, #{originDetail}, #{destination}, #{destinationDetail}, #{departureTime}, #{remarks}, #{status});\n")
    void insertCarpool(Carpool carpool);

    @Insert("INSERT INTO participant(participant_id, carpool_id, user_id) VALUES(#{participantId}, #{carpoolId}, #{userId})")
    void insertParticipant(Participant participant);

    @SelectProvider(type = CarpoolSqlProvider.class, method = "browseCarpoolsSql")
    List<CarpoolWithParticipantCount> browseCarpools(@Param("origin") String origin, @Param("destination") String destination);

    @SelectProvider(type = CarpoolSqlProvider.class, method = "historyWithParticipantsSql")
    @Results({
            @Result(column = "carpool_id", property = "carpoolId"),
            @Result(column = "user_id", property = "userId"),
            @Result(column = "origin", property = "origin"),
            @Result(column = "origin_detail", property = "originDetail"),
            @Result(column = "destination", property = "destination"),
            @Result(column = "destination_detail", property = "destinationDetail"),
            @Result(column = "departure_time", property = "departureTime"),
            @Result(column = "remarks", property = "remarks"),
            @Result(column = "status", property = "status"),
            @Result(property = "participants", javaType = List.class, column = "carpool_id",
                    many = @Many(select = "com.cityu_dg._5003.mapper.CarpoolMapper.mapParticipants"))
    })
    List<CarpoolWithParticipant> historyCarpools(@Param("userId") String userId);

    // 只返回 userId
    @Select("SELECT p.user_id FROM participant p WHERE p.carpool_id = #{carpoolId}")
    @Results({
            @Result(column = "user_id", property = "userId")
    })
    List<User> mapParticipants(@Param("carpoolId") String carpoolId);

    @Update("UPDATE carpool SET status = 0 WHERE carpool_id = #{carpoolId}")
    void finishCarpool(String carpoolId);
}
