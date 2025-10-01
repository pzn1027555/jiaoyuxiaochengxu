package com.education.admin.modules.community.service;

import com.github.pagehelper.PageInfo;

import java.util.Map;

public interface CommunityService {

    PageInfo<Map<String, Object>> pagePosts(String keyword, Long categoryId, int pageNum, int pageSize);

    Map<String, Object> getPostDetail(Long id);
    Map<String, Object> getPostDetail(Long id, Long userId);

    Map<String, Object> getStatistics();

    Long createPost(Map<String, Object> post);

    void addView(Long id);

    void addLike(Long id);

    void deletePost(Long id);

    // comments
    com.github.pagehelper.PageInfo<Map<String, Object>> pageComments(Long postId, Integer pageNum, Integer pageSize);
    com.github.pagehelper.PageInfo<Map<String, Object>> pageReplies(Long postId, Long parentId, Integer pageNum, Integer pageSize);
    
    // comments with user like status
    com.github.pagehelper.PageInfo<Map<String, Object>> pageCommentsWithLikeStatus(Long postId, Integer pageNum, Integer pageSize, Long userId, String userType);
    com.github.pagehelper.PageInfo<Map<String, Object>> pageRepliesWithLikeStatus(Long postId, Long parentId, Integer pageNum, Integer pageSize, Long userId, String userType);

    Long addComment(Map<String, Object> params);

    void deleteComment(Long id, Long postId);

    // comment likes
    boolean toggleCommentLike(Long commentId, Long userId, String userType);

    // likes idempotent toggle
    boolean toggleLike(Long postId, Long userId, String userType);

    java.util.List<java.util.Map<String,Object>> listTopResources(int limit);
    java.util.List<java.util.Map<String,Object>> listFollowingResources(Long studentId, int limit);
    com.github.pagehelper.PageInfo<java.util.Map<String,Object>> pageResources(String keyword, String fileType, int pageNum, int pageSize);
    void addResourceDownload(Long id);
    com.github.pagehelper.PageInfo<java.util.Map<String,Object>> pagePostsFiltered(Long subjectId, String subType, String keyword, Long categoryId, Long userId, String userType, int pageNum, int pageSize);
}


