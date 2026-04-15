package com.nt.jwt;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.nt.service.CustomUserDetails;
import com.nt.service.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter{

	@Autowired
	private JwtService jwtService;
	@Autowired
	private ApplicationContext applicationContext;
	/*
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
	    String header = 	request.getHeader("Authorization");
	    String token = null;
	    String username = null;
	    
	    if(header!=null&&header.startsWith("Bearer")) {
	    	token = header.substring(7); 
	    	System.out.println(token);
	    	username = jwtService.extractusername(token);
	    	System.out.println(username);
	    }
	    if(username!=null&&SecurityContextHolder.getContext().getAuthentication()==null) {
	    	UserDetails details = applicationContext.getBean(CustomUserDetailsService.class).loadUserByUsername(username);
	    	if(jwtService.validateToken(token)) {
	    		Authentication authentication = 
	    				new UsernamePasswordAuthenticationToken(details, null,details.getAuthorities());
	    		SecurityContextHolder.getContext().setAuthentication(authentication);
	    	}
	    		else {
	    		    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
	    		    return;
	    	}
	    
	  }
	    filterChain.doFilter(request, response);
	}
*/
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
	        throws ServletException, IOException {

		Authentication exeauthentication = SecurityContextHolder.getContext().getAuthentication();

		if (exeauthentication != null && exeauthentication.isAuthenticated()) {
			System.out.println("User is already authenticated.");
			filterChain.doFilter(request, response);
			return;
		}

		String header = request.getHeader("Authorization");
		String token = null;
		String username = null;

		if (header != null && header.startsWith("Bearer ")) {
			token = header.substring(7);
			username = jwtService.extractusername(token);
			System.out.println("Extracted Username: " + username);
		}

		if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
			UserDetails details = applicationContext.getBean(CustomUserDetailsService.class).loadUserByUsername(username);

			if (jwtService.validateToken(token)) {
				Authentication authentication = new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
				SecurityContextHolder.getContext().setAuthentication(authentication);
				System.out.println("Authentication set for user: " + username);
			} else {
				response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				System.out.println("Token validation failed");
				return;
			}
		}

		filterChain.doFilter(request, response);
	}
}
