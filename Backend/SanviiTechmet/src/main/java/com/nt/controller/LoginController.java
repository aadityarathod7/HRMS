package com.nt.controller;

import com.nt.jwt.JwtService;
import com.nt.request.CreateUserRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
@RestController
@RequestMapping("/auth")
public class LoginController {
    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginapi(@RequestBody CreateUserRequest createUserRequest){
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(createUserRequest.getUserName(), createUserRequest.getPassword())
            );
            System.out.println(authentication.isAuthenticated());
            if(authentication.isAuthenticated()) {
                String token = jwtService.generateToken(authentication);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                Map<String, String> response = new HashMap<>();
                response.put("token", token);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Invalid credentials");
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }
        } catch (AuthenticationException e) {
            System.out.println(e.getMessage());
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid credentials");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Something went wrong. Please try again later.");
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            jwtService.blacklistToken(token);
            return ResponseEntity.ok("Logged out successfully");
        }
        return ResponseEntity.badRequest().body("Invalid token");
    }
}
