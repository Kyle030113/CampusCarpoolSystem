package com.cityu_dg._5003.mapper.provider;

import java.util.Map;

public class CarpoolSqlProvider {

    public String browseCarpoolsSql(Map<String, Object> params) {
        StringBuilder sql = new StringBuilder(
                "SELECT c.*, COUNT(p.user_id) AS participant_count " +
                        "FROM carpool c " +
                        "LEFT JOIN participant p ON c.carpool_id = p.carpool_id " +
                        "WHERE 1=1 AND c.status = 1"
        );

        String origin = (String) params.get("origin");
        String destination = (String) params.get("destination");

        if (origin != null) {
            sql.append(" AND c.origin = #{origin}");
        }

        if (destination != null) {
            sql.append(" AND c.destination = #{destination}");
        }

        sql.append(" GROUP BY c.carpool_id ORDER BY c.departure_time DESC");

        return sql.toString();
    }

    public String historyWithParticipantsSql(Map<String, Object> params) {
        String userId = (String) params.get("userId");

        return new StringBuilder()
                .append("SELECT c.* ")
                .append("FROM carpool c ")
                .append("WHERE c.user_id = #{userId} ")
                .append("ORDER BY c.departure_time DESC")
                .toString();
    }
}
