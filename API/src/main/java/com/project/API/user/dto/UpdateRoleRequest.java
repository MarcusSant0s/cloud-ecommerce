package com.project.API.user.dto;

import com.project.API.user.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(
        @NotNull
        Role role
) {}
