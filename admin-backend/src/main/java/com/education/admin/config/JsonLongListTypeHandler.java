package com.education.admin.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * JSON 数组 <Long> 类型处理器（用于 MySQL JSON/VARCHAR 列）
 */
@MappedJdbcTypes({JdbcType.LONGVARCHAR, JdbcType.VARCHAR})
@MappedTypes({List.class})
public class JsonLongListTypeHandler extends BaseTypeHandler<List<Long>> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<Long> parameter, JdbcType jdbcType) throws SQLException {
        try {
            ps.setString(i, objectMapper.writeValueAsString(parameter != null ? parameter : new ArrayList<>()));
        } catch (JsonProcessingException e) {
            throw new SQLException("Error converting List<Long> to JSON string", e);
        }
    }

    @Override
    public List<Long> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String json = rs.getString(columnName);
        return parseJson(json);
    }

    @Override
    public List<Long> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String json = rs.getString(columnIndex);
        return parseJson(json);
    }

    @Override
    public List<Long> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String json = cs.getString(columnIndex);
        return parseJson(json);
    }

    private List<Long> parseJson(String json) throws SQLException {
        if (json == null || json.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            // 兼容 [101, "102"] 两种形式
            List<Object> raw = objectMapper.readValue(json, new TypeReference<List<Object>>() {});
            List<Long> out = new ArrayList<>();
            for (Object o : raw) {
                if (o == null) continue;
                if (o instanceof Number) {
                    out.add(((Number) o).longValue());
                } else {
                    try {
                        out.add(Long.parseLong(String.valueOf(o)));
                    } catch (NumberFormatException ignored) { /* skip non-numeric */ }
                }
            }
            return out;
        } catch (JsonProcessingException e) {
            throw new SQLException("Error parsing JSON string to List<Long>", e);
        }
    }
}


