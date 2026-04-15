package com.nt.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import com.nt.entity.User;
import com.nt.repository.IUserRepository;

import jakarta.annotation.PostConstruct;

@Service
public class CustomUserDetailsService implements UserDetailsService{
@Autowired
private IUserRepository iUserRepository;
@PostConstruct
public void init() {
    System.out.println("CustomUserDetailsService loaded successfully");
}
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		// TODO Auto-generated method stub
		System.out.println("Custom user details");
		
//	  User user = 	iUserRepository.findByEmail(username);
		User user = iUserRepository.findByUserName(username);
		System.out.println("user"+user);

	  if(user==null)
		  throw new UsernameNotFoundException("User Not Found !");
		return new CustomUserDetails(user);
	}

}
