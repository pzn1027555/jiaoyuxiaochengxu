package com.education.admin.modules.community.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 社区帖子实体
 */
@Data
public class CommunityPost {
    
    private Long id;
    
    private String title;
    
    private String content;
    
    private Long authorId;
    
    private String authorName;
    
    private String authorAvatar;
    
    private Long categoryId;
    
    private String categoryName;
    
    private List<String> images;     // 图片列表
    
    private List<String> tags;       // 标签列表
    
    private Integer viewCount;       // 浏览次数
    
    private Integer likeCount;       // 点赞次数
    
    private Integer commentCount;    // 评论次数
    
    private Integer status;          // 状态 0-待审核 1-已发布 2-已删除
    
    private LocalDateTime createTime;
    
    private LocalDateTime updateTime;
}