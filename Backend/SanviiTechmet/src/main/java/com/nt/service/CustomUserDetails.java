package com.nt.service;

import java.util.Collection;
import java.util.HashSet;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.nt.entity.User;

@Component
public class CustomUserDetails implements UserDetails{

	 private Integer id;
	 private String userName;
	 private String password;
	 private Collection<SimpleGrantedAuthority> authorities = 
			 new HashSet<SimpleGrantedAuthority>();
	
	 public CustomUserDetails(User user) {
		// TODO Auto-generated constructor stub
		 this.id = user.getId();
		 this.userName = user.getUserName();
		 this.password = user.getPassword();
		 this.authorities = user.getRoles().stream()
				 .map(auth->new SimpleGrantedAuthority(auth.getRole()))
				 .collect(Collectors.toSet());
	}
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// TODO Auto-generated method stub
       return this.authorities;
	}

	@Override
	public String getPassword() {
		// TODO Auto-generated method stub
		return this.password;
	}

	@Override
	public String getUsername() {
		// TODO Auto-generated method stub
		return this.userName;
	}

}
