package com.sssp.security;

import com.sssp.user.User;
import org.springframework.stereotype.Component;

@Component
public class EvaluatorPermissionChecker {

    public boolean canEvaluate(User user) {
        return user != null && user.isEvaluatorPermission();
    }
}
