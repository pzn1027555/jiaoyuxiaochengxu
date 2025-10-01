package com.education.admin.modules.community.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface CommunityMapper {

    List<Map<String, Object>> pagePosts(@Param("keyword") String keyword,
                                        @Param("categoryId") Long categoryId);

    Map<String, Object> getPostById(@Param("id") Long id);
    Map<String, Object> getPostByIdWithUser(@Param("id") Long id, @Param("userId") Long userId);

    Map<String, Object> getStatistics();

    int insertPost(Map<String, Object> post);

    int incrementView(@Param("id") Long id);

    int incrementLike(@Param("id") Long id);

    int softDelete(@Param("id") Long id);

    // comments
    List<Map<String, Object>> listComments(@Param("postId") Long postId);
    List<Map<String, Object>> listComments(@Param("postId") Long postId, @Param("parentId") Long parentId);

    int insertComment(Map<String, Object> params);

    int softDeleteComment(@Param("id") Long id);

    int incrementPostComment(@Param("postId") Long postId);

    int decrementPostComment(@Param("postId") Long postId);

    // like idempotency
    int countLike(@Param("postId") Long postId, @Param("userId") Long userId, @Param("userType") String userType);
    int insertLike(@Param("postId") Long postId, @Param("userId") Long userId, @Param("userType") String userType);
    int deleteLike(@Param("postId") Long postId, @Param("userId") Long userId, @Param("userType") String userType);
    int decrementLike(@Param("postId") Long postId);

    // comment like idempotency
    int countCommentLike(@Param("commentId") Long commentId, @Param("userId") Long userId, @Param("userType") String userType);
    int insertCommentLike(@Param("commentId") Long commentId, @Param("userId") Long userId, @Param("userType") String userType);
    int deleteCommentLike(@Param("commentId") Long commentId, @Param("userId") Long userId, @Param("userType") String userType);
    int incrementCommentLike(@Param("commentId") Long commentId);
    int decrementCommentLike(@Param("commentId") Long commentId);

    // comments with user like status
    List<Map<String, Object>> listCommentsWithLikeStatus(@Param("postId") Long postId, @Param("parentId") Long parentId, @Param("userId") Long userId, @Param("userType") String userType);

    // resources
    java.util.List<java.util.Map<String,Object>> listTopResources(@Param("limit") int limit);
    java.util.List<java.util.Map<String,Object>> listFollowingResources(@Param("studentId") Long studentId, @Param("limit") int limit);
    java.util.List<java.util.Map<String,Object>> listResources(@Param("keyword") String keyword, @Param("fileType") String fileType);
    int incrementResourceDownload(@Param("id") Long id);

    // posts filter by subject and subcategory
    java.util.List<java.util.Map<String,Object>> pagePostsFiltered(@Param("subjectId") Long subjectId,
        @Param("subType") String subType,
        @Param("keyword") String keyword,
        @Param("categoryId") Long categoryId,
        @Param("userId") Long userId,
        @Param("userType") String userType);

    // ===== Admin: Post management =====
    List<Map<String, Object>> adminPagePosts(@Param("keyword") String keyword,
                                             @Param("authorName") String authorName,
                                             @Param("postStatus") Integer postStatus,
                                             @Param("auditStatus") Integer auditStatus);

    Map<String, Object> adminGetPostDetail(@Param("id") Long id);

    int updateAuditStatus(@Param("id") Long id,
                          @Param("auditStatus") Integer auditStatus,
                          @Param("auditRemark") String auditRemark,
                          @Param("auditUserId") Long auditUserId);

    int batchUpdateAuditStatus(@Param("ids") java.util.List<Long> ids,
                               @Param("auditStatus") Integer auditStatus,
                               @Param("auditRemark") String auditRemark,
                               @Param("auditUserId") Long auditUserId);

    int publishPost(@Param("id") Long id);

    int takeDownPost(@Param("id") Long id, @Param("reason") String reason);

    int updateTop(@Param("id") Long id, @Param("isTop") Integer isTop);

    int updateEssence(@Param("id") Long id, @Param("isEssence") Integer isEssence);

    int deletePost(@Param("id") Long id);

    int hardDeletePost(@Param("id") Long id);

    // ===== Admin: Resource management =====
    java.util.List<java.util.Map<String,Object>> adminPageCommunityResources(@Param("keyword") String keyword,
                                                                             @Param("fileType") String fileType,
                                                                             @Param("uploaderName") String uploaderName);

    java.util.List<java.util.Map<String,Object>> adminPageTeacherResources(@Param("keyword") String keyword,
                                                                           @Param("fileType") String fileType,
                                                                           @Param("uploaderName") String uploaderName);

    java.util.Map<String,Object> adminGetCommunityResourceDetail(@Param("id") Long id);

    java.util.Map<String,Object> adminGetTeacherResourceDetail(@Param("id") Long id);

    int markCommunityResourceDeleted(@Param("id") Long id);
    
    int markTeacherResourceDeleted(@Param("id") Long id);

    int hardDeleteCommunityResource(@Param("id") Long id);

    int hardDeleteTeacherResource(@Param("id") Long id);

    int insertCommunityResource(@Param("title") String title,
                                @Param("description") String description,
                                @Param("fileUrl") String fileUrl,
                                @Param("coverUrl") String coverUrl,
                                @Param("fileType") String fileType,
                                @Param("price") java.math.BigDecimal price,
                                @Param("publisherUserId") Long publisherUserId);

    String getCommunityResourceFileUrl(@Param("id") Long id);

    String getTeacherResourceFileUrl(@Param("id") Long id);

    int updateCommunityResource(@Param("id") Long id,
                                @Param("title") String title,
                                @Param("description") String description,
                                @Param("fileUrl") String fileUrl,
                                @Param("coverUrl") String coverUrl,
                                @Param("fileType") String fileType,
                                @Param("price") java.math.BigDecimal price);

    int updateTeacherResource(@Param("id") Long id,
                               @Param("title") String title,
                               @Param("description") String description,
                               @Param("fileUrl") String fileUrl,
                               @Param("coverUrl") String coverUrl,
                               @Param("fileType") String fileType);
}


