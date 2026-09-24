package handler

import (
	"net/http"
	"strconv"

	"github.com/Bobbb00/splitbill-api/internal/model"
	"github.com/Bobbb00/splitbill-api/internal/model/dto"
	"github.com/Bobbb00/splitbill-api/internal/service"
	"github.com/Bobbb00/splitbill-api/pkg/response"
	"github.com/labstack/echo/v4"
)

type GroupHandler struct {
	groupService service.GroupService
}

func NewGroupHandler(groupService service.GroupService) *GroupHandler {
	return &GroupHandler{groupService: groupService}
}

func (h *GroupHandler) ListGroupByUser(c echo.Context) error {
	userID := c.Get("user_id").(int64)
	groups, err := h.groupService.ListGroupByUser(c.Request().Context(), userID)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Gagal mengambil grup")
	}
	if groups == nil {
		groups = []*model.Group{}
	}
	return response.Success(c, http.StatusOK, "Grup berhasil diambil", groups)
}

// @Summary Create Group
// @Description Create a new splitbill group
// @Tags Group
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateGroupRequest true "Group Data"
// @Success 201 {object} response.APIResponse
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /groups [post]
func (h *GroupHandler) CreateGroup(c echo.Context) error {
	var req dto.CreateGroupRequest

	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Format JSON tidak valid")
	}

	if err := validate.Struct(req); err != nil {
		return response.ValidationError(c, formatValidationErrors(err))
	}

	userID := c.Get("user_id").(int64)

	group, err := h.groupService.CreateGroup(c.Request().Context(), userID, req.Name, req.Description)
	if err != nil {
		return response.Error(c, http.StatusInternalServerError, "Gagal membuat grup")
	}
	return response.Success(c, http.StatusCreated, "Grup berhasil dibuat", group)
}

func (h *GroupHandler) JoinGroup(c echo.Context) error {
	var req dto.JoinGroupRequest
	if err := c.Bind(&req); err != nil {
		return response.Error(c, http.StatusBadRequest, "Format JSON tidak valid")
	}

	if err := validate.Struct(req); err != nil {
		return response.ValidationError(c, formatValidationErrors(err))
	}

	userID := c.Get("user_id").(int64)

	err := h.groupService.JoinGroup(c.Request().Context(), userID, req.InviteCode)
	if err != nil {
		if err == service.ErrInvalidInviteCode {
			return response.Error(c, http.StatusNotFound, "Kode invite tidak valid atau grup tidak ditemukan")
		}
		return response.Error(c, http.StatusInternalServerError, "Gagal bergabung dengan grup")
	}
	return response.Success(c, http.StatusOK, "Berhasil bergabung dengan grup", nil)
}

func (h *GroupHandler) GetGroupDetail(c echo.Context) error {
	groupID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID Grup tidak valid")
	}

	userID := c.Get("user_id").(int64)

	group, members, err := h.groupService.GetGroupDetail(c.Request().Context(), groupID, userID)
	if err != nil {
		if err == service.ErrForbiddenAccess {
			return response.Error(c, http.StatusForbidden, err.Error())
		}
		return response.Error(c, http.StatusInternalServerError, "Gagal mengambil detail grup")
	}

	data := map[string]interface{}{
		"group":   group,
		"members": members,
	}

	return response.Success(c, http.StatusOK, "Detail grup berhasil diambil", data)
}

func (h *GroupHandler) RemoveMember(c echo.Context) error {
	groupID, err := strconv.ParseInt(c.Param("id"), 10, 64)

	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID Grup tidak valid")
	}

	memberID, err := strconv.ParseInt(c.Param("userID"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID Member tidak valid")
	}

	adminID := c.Get("user_id").(int64)

	err = h.groupService.RemoveMember(c.Request().Context(), adminID, groupID, memberID)
	if err != nil {
		if err == service.ErrForbiddenAccess {
			return response.Error(c, http.StatusForbidden, err.Error())
		}

		if err == service.ErrSelfRemoval {
			return response.Error(c, http.StatusBadRequest, err.Error())
		}
		return response.Error(c, http.StatusInternalServerError, "Gagal Menghapus Anggota")
	}
	return response.Success(c, http.StatusOK, "Anggota Berhasil Dihapus", nil)
}

func (h *GroupHandler) RegenerateInviteCode(c echo.Context) error {
	groupID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID Grup tidak valid")
	}

	adminID := c.Get("user_id").(int64)

	newCode, err := h.groupService.RegenerateInviteCode(c.Request().Context(), adminID, groupID)
	if err != nil {
		if err == service.ErrForbiddenAccess {
			return response.Error(c, http.StatusForbidden, err.Error())
		}
		return response.Error(c, http.StatusInternalServerError, "Gagal mereset kode invite")
	}

	return response.Success(c, http.StatusOK, "Kode invite berhasil direset", map[string]string{
		"new_invite_code": newCode,
	})
}

func (h *GroupHandler) DeleteGroup(c echo.Context) error {
	groupID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, "ID Grup tidak valid")
	}

	adminID := c.Get("user_id").(int64)

	err = h.groupService.DeleteGroup(c.Request().Context(), adminID, groupID)
	if err != nil {
		if err == service.ErrForbiddenAccess {
			return response.Error(c, http.StatusForbidden, err.Error())
		}
		return response.Error(c, http.StatusInternalServerError, "Gagal menghapus grup")
	}
	return response.Success(c, http.StatusOK, "Grup berhasil dihapus", nil)
}
