package com.cityu_dg._5003.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cityu_dg._5003.entity.User;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    @Select("Select * FROM user WHERE open_id = #{openId}")
    User getUserByOpenId(String openId);

    @Insert("INSERT INTO user(user_id, open_id, wechat_nickname, avatar_url, phone_number) VALUES(#{userId}, #{openId}, #{wechatNickname}, #{avatarUrl}, #{phoneNumber})")
    void insertUser(User user);
}
